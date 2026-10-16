import { describe, expect, it } from 'vitest';
import { getDepartment } from '../content/departments';
import type { CourseState } from '../types';
import { fresh, withDepartment } from './fresh';
import { canEnter, canLeave, firstIncomplete, runKey, runNow } from './gates';

const base = (): CourseState => withDepartment({ ...fresh(), started: true }, 'cs');

function record(s: CourseState): CourseState {
  const r = runNow(s, getDepartment(s.department)!);
  return { ...s, runCount: s.runCount + 1, lastRun: { key: runKey(s), routes: {}, counts: r.counts, trapOk: r.trapOk } };
}

describe('진입', () => {
  it('시작 전에는 질문 화면만 열린다', () => {
    expect(firstIncomplete(fresh())).toBe('question');
    expect(canEnter('work', fresh())).toBe(false);
  });

  it('부서를 고르면 하는 일까지 열린다', () => {
    expect(canEnter('work', base())).toBe(true);
    expect(canEnter('asis', base())).toBe(false);
  });
});

describe('누가 하나', () => {
  const withActors = (a: CourseState['actors']) => ({ ...base(), actors: a });

  it('Human이 없으면 통과하지 않는다', () => {
    expect(canLeave('actors', withActors({ in: 'Rule', split: 'AI', judge: 'Rule', act: 'AI', handoff: 'Data' }))).toBe(false);
  });

  it('전부 Human이면 통과하지 않는다', () => {
    expect(canLeave('actors', withActors({ in: 'Human', split: 'Human', judge: 'Human', act: 'Human', handoff: 'Human' }))).toBe(false);
  });

  it('빈 칸이 있으면 통과하지 않는다', () => {
    expect(canLeave('actors', withActors({ in: 'Rule', split: null, judge: 'Rule', act: 'AI', handoff: 'Human' }))).toBe(false);
  });

  it('Human이 일부면 통과한다', () => {
    expect(canLeave('actors', withActors({ in: 'Rule', split: 'AI', judge: 'Rule', act: 'AI', handoff: 'Human' }))).toBe(true);
  });
});

describe('실행 통과', () => {
  const cs = getDepartment('cs')!;

  it('실행하지 않았으면 통과하지 않는다', () => {
    expect(canLeave('run', base())).toBe(false);
  });

  it('초기 조건으로 실행하면 함정 때문에 통과하지 않는다', () => {
    expect(canLeave('run', record(base()))).toBe(false);
  });

  it('고친 조건으로 다시 실행하면 통과한다', () => {
    expect(canLeave('run', record({ ...base(), handoff: cs.fixedHandoff }))).toBe(true);
  });

  it('통과 뒤 조건을 바꾸면 다시 실행하기 전까지 통과하지 않는다', () => {
    const passed = record({ ...base(), handoff: cs.fixedHandoff });
    const changed = { ...passed, rule: { clauses: [{ field: 'kind', value: '배송' }] } };
    expect(canLeave('run', changed)).toBe(false);
  });

  it('자료 문장을 바꿔도 다시 실행해야 한다', () => {
    const passed = record({ ...base(), handoff: cs.fixedHandoff });
    expect(canLeave('run', { ...passed, caseEdit: { id: 'cs1', text: '바뀐 문장' } })).toBe(false);
  });
});

describe('기타 단계', () => {
  it('아픈 곳: 스티커 네 개와 여덟 글자 문장', () => {
    const s = { ...base(), stickers: { 'cs-s1': 'repeat', 'cs-s2': 'repeat', 'cs-s3': 'wait' } as CourseState['stickers'], problem: '배송 답을 매번 다시 쓴다' };
    expect(canLeave('problem', s)).toBe(false);
    expect(canLeave('problem', { ...s, stickers: { ...s.stickers, 'cs-s4': 'mistake' } })).toBe(true);
  });

  it('자료 열: 오늘 두 개, 나중 한 개, 전부 분류', () => {
    const cs = getDepartment('cs')!;
    const all = Object.fromEntries(cs.columns.map((c) => [c.id, 'drop'])) as CourseState['columnMode'];
    expect(canLeave('columns', { ...base(), columnMode: { ...all, kind: 'today', tone: 'today', days: 'later' } })).toBe(true);
    expect(canLeave('columns', { ...base(), columnMode: { kind: 'today', tone: 'today', days: 'later' } })).toBe(false);
  });

  it('오늘 자료: 함정 건은 고쳐도 통과하지 않는다', () => {
    expect(canLeave('cases', { ...base(), caseEdit: { id: 'cs7', text: '다른 문장' } })).toBe(false);
    expect(canLeave('cases', { ...base(), caseEdit: { id: 'cs1', text: '주문한 쌀이 어디쯤 왔나요?' } })).toBe(false);
    expect(canLeave('cases', { ...base(), caseEdit: { id: 'cs1', text: '쌀 언제 와요?' } })).toBe(true);
  });
});
