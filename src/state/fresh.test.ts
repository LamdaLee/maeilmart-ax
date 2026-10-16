import { describe, expect, it } from 'vitest';
import { getDepartment } from '../content/departments';
import { fresh, hasProgressAfterDepartment, hydrate, withDepartment } from './fresh';

describe('hydrate', () => {
  it('저장값이 없으면 새 과정', () => {
    expect(hydrate(null)).toEqual(fresh());
  });

  it('JSON이 아니면 새 과정', () => {
    expect(hydrate('{깨짐')).toEqual(fresh());
  });

  it('저장했던 상태를 그대로 되돌린다', () => {
    const s = { ...withDepartment({ ...fresh(), started: true }, 'cs'), problem: '배송 답을 매번 다시 쓴다' };
    expect(hydrate(JSON.stringify(s))).toEqual(s);
  });

  it('없는 부서 id는 새 과정', () => {
    expect(hydrate(JSON.stringify({ ...fresh(), department: 'hr' }))).toEqual(fresh());
  });

  it('하는 일 줄 수가 다르면 새 과정', () => {
    expect(hydrate(JSON.stringify({ ...fresh(), work: ['a', 'b'] }))).toEqual(fresh());
  });

  it('자동 조건이 세 절이면 새 과정', () => {
    const c = { field: 'kind', value: '배송' };
    expect(hydrate(JSON.stringify({ ...fresh(), rule: { clauses: [c, c, c] } }))).toEqual(fresh());
  });

  it('버전이 다르면 새 과정', () => {
    expect(hydrate(JSON.stringify({ ...fresh(), version: 2 }))).toEqual(fresh());
  });

  it('부서에 없는 장면·열 id와 함정 건 수정은 걸러 낸다', () => {
    const s = {
      ...withDepartment(fresh(), 'cs'),
      stickers: { 'cs-s1': 'repeat', ghost: 'wait' },
      columnMode: { tone: 'today', ghost: 'drop' },
      caseEdit: { id: 'cs7', text: '함정 수정' },
    };
    const h = hydrate(JSON.stringify(s));
    expect(h.stickers).toEqual({ 'cs-s1': 'repeat' });
    expect(h.columnMode).toEqual({ tone: 'today' });
    expect(h.caseEdit).toBeNull();
  });

  it('스티커 종류가 이상하면 새 과정', () => {
    expect(hydrate(JSON.stringify({ ...withDepartment(fresh(), 'cs'), stickers: { 'cs-s1': 'boom' } }))).toEqual(fresh());
  });
});

describe('withDepartment', () => {
  it('부서의 초기 규칙과 Hand-off 조건을 넣는다', () => {
    const stock = getDepartment('stock')!;
    const s = withDepartment(fresh(), 'stock');
    expect(s.rule).toEqual(stock.initialRule);
    expect(s.handoff).toEqual(stock.initialHandoff);
  });

  it('초기 규칙을 복사해 넣어 부서 데이터가 바뀌지 않는다', () => {
    const s = withDepartment(fresh(), 'cs');
    s.rule.clauses[0].value = '바뀜';
    expect(getDepartment('cs')!.initialRule.clauses[0].value).toBe('배송');
  });

  it('부서를 바꾸면 이후 기록과 실행 건수를 지운다', () => {
    const s = { ...withDepartment({ ...fresh(), started: true }, 'cs'), problem: '문장', runCount: 3 };
    const next = withDepartment(s, 'store');
    expect(next.problem).toBe('');
    expect(next.runCount).toBe(0);
    expect(next.started).toBe(true);
  });

  it('같은 부서를 다시 고르면 아무것도 지우지 않는다', () => {
    const s = { ...withDepartment(fresh(), 'cs'), problem: '문장' };
    expect(withDepartment(s, 'cs')).toBe(s);
  });

  it('부서만 고른 상태는 지울 것이 없다', () => {
    const s = withDepartment({ ...fresh(), started: true }, 'cs');
    expect(hasProgressAfterDepartment(s)).toBe(false);
    expect(hasProgressAfterDepartment({ ...s, work: ['일', '', ''] })).toBe(true);
  });
});
