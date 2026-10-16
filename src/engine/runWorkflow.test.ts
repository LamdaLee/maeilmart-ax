import { describe, expect, it } from 'vitest';
import { DEPARTMENTS, getDepartment } from '../content/departments';
import type { Actor, Department, Slots } from '../types';
import { clauseMatches, decide, ruleMatches, runWorkflow, SPLIT_TRACE, type RunInput } from './runWorkflow';

const noActors: Slots<Actor | null> = { in: null, split: null, judge: null, act: null, handoff: null };
const aiActors: Slots<Actor | null> = { in: 'Rule', split: 'AI', judge: 'Rule', act: 'AI', handoff: 'Human' };

function input(dept: Department, over: Partial<RunInput> = {}): RunInput {
  return {
    department: dept,
    rule: dept.initialRule,
    handoff: dept.initialHandoff,
    actors: noActors,
    caseEdit: null,
    ...over,
  };
}

const expectedCounts = {
  cs: { auto: 3, human: 7, data: 0 },
  stock: { auto: 9, human: 0, data: 1 },
  store: { auto: 9, human: 1, data: 0 },
};

describe.each(DEPARTMENTS)('$name', (dept) => {
  it('초기 조건에서는 함정 한 건만 어긋난다', () => {
    const result = runWorkflow(input(dept));
    expect(result.trapOk).toBe(false);
    const wrong = result.rows.filter((r) => !r.ok);
    expect(wrong).toHaveLength(1);
    expect(wrong[0].trap).toBe(true);
  });

  it('힌트대로 넘김 조건을 고치면 10건 모두 기대와 맞는다', () => {
    const result = runWorkflow(input(dept, { handoff: dept.fixedHandoff }));
    expect(result.trapOk).toBe(true);
    expect(result.allOk).toBe(true);
    expect(result.counts).toEqual(expectedCounts[dept.id]);
  });

  it('문장을 고쳐도 판단은 사실값으로만 한다', () => {
    const target = dept.cases.find((c) => !c.trap)!;
    const before = runWorkflow(input(dept));
    const after = runWorkflow(input(dept, { caseEdit: { id: target.id, text: '완전히 다른 문장입니다' } }));
    expect(after.rows.map((r) => r.route)).toEqual(before.rows.map((r) => r.route));
    expect(after.rows.find((r) => r.caseId === target.id)!.sentence).toBe('완전히 다른 문장입니다');
  });

  it('함정 건의 문장 수정은 반영되지 않는다', () => {
    const trap = dept.cases.find((c) => c.trap)!;
    const result = runWorkflow(input(dept, { caseEdit: { id: trap.id, text: '바꾼 문장' } }));
    expect(result.rows.find((r) => r.caseId === trap.id)!.sentence).toBe(trap.sentence);
  });
});

describe('조건 일치', () => {
  const facts = { kind: '배송', tone: '화남' };

  it('빈 절은 어떤 건과도 맞지 않는다', () => {
    expect(clauseMatches({ field: '', value: '' }, facts)).toBe(false);
    expect(clauseMatches({ field: 'kind', value: '' }, facts)).toBe(false);
    expect(clauseMatches({ field: '', value: '배송' }, facts)).toBe(false);
  });

  it('없는 사실값 이름은 맞지 않는다', () => {
    expect(clauseMatches({ field: 'weather', value: '비' }, facts)).toBe(false);
  });

  it('절이 없는 자동 규칙은 맞지 않는다', () => {
    expect(ruleMatches({ clauses: [] }, facts)).toBe(false);
  });

  it('두 절 중 하나라도 비어 있으면 자동 규칙은 맞지 않는다', () => {
    expect(ruleMatches({ clauses: [{ field: 'kind', value: '배송' }, { field: '', value: '' }] }, facts)).toBe(false);
  });

  it('두 절이 모두 맞아야 자동 규칙이 맞는다', () => {
    expect(ruleMatches({ clauses: [{ field: 'kind', value: '배송' }, { field: 'tone', value: '화남' }] }, facts)).toBe(true);
    expect(ruleMatches({ clauses: [{ field: 'kind', value: '배송' }, { field: 'tone', value: '평온' }] }, facts)).toBe(false);
  });
});

describe('우선순위와 추적 문장', () => {
  const cs = getDepartment('cs')!;
  const trap = cs.cases.find((c) => c.trap)!;

  it('넘김 조건이 자동 규칙보다 먼저다', () => {
    const d = decide(trap, input(cs, { handoff: cs.fixedHandoff }));
    expect(d.route).toBe('human');
    expect(d.trace).toContain('Human · 사람에게 넘깁니다');
  });

  it('넘김 조건이 비어 있으면 자동 규칙으로 간다', () => {
    const d = decide(trap, input(cs, { handoff: { clause: { field: '', value: '' }, to: 'human' } }));
    expect(d.route).toBe('auto');
    expect(d.trace[d.trace.length - 1]).toBe(`Rule · ${cs.autoResult}`);
  });

  it('아무 조건에도 맞지 않으면 부서 기본 처리로 간다', () => {
    const d = decide(trap, input(cs, { rule: { clauses: [] }, handoff: { clause: { field: '', value: '' }, to: 'human' } }));
    expect(d.route).toBe(cs.fallback.route);
    expect(d.text).toBe(cs.fallback.text);
  });

  it('나누기 칸이 AI이면 의도 나누기 문장이 붙는다', () => {
    expect(decide(trap, input(cs, { actors: aiActors })).trace[0]).toBe(SPLIT_TRACE);
    expect(decide(trap, input(cs)).trace).not.toContain(SPLIT_TRACE);
  });

  it('함정이 잘못 자동 처리되면 AI 초안이 보인다', () => {
    const d = decide(trap, input(cs, { actors: aiActors }));
    expect(d.route).toBe('auto');
    expect(d.trace.some((t) => t.startsWith('AI 초안'))).toBe(true);
  });

  it('AI가 어디에도 없으면 초안은 보이지 않는다', () => {
    const d = decide(trap, input(cs));
    expect(d.trace.some((t) => t.startsWith('AI 초안'))).toBe(false);
  });

  it('예전 사례로 넘기면 비슷한 과거가 붙는다', () => {
    const stock = getDepartment('stock')!;
    const umbrella = stock.cases.find((c) => c.trap)!;
    const d = decide(umbrella, input(stock, { handoff: stock.fixedHandoff }));
    expect(d.route).toBe('data');
    expect(d.trace).toContain(`비슷한 과거 · ${umbrella.past}`);
  });

  it('모든 건을 넘기는 조건은 함정은 맞히지만 나머지를 어긋나게 한다', () => {
    const stock = getDepartment('stock')!;
    const result = runWorkflow(input(stock, { handoff: { clause: { field: 'weather', value: '비' }, to: 'data' } }));
    expect(result.trapOk).toBe(true);
    expect(result.allOk).toBe(false);
  });
});
