import { describe, expect, it } from 'vitest';
import { DEPARTMENTS } from './departments';

describe.each(DEPARTMENTS)('부서 데이터: $name', (dept) => {
  it('장면 8개, 자료 10건', () => {
    expect(dept.scenes).toHaveLength(8);
    expect(dept.cases).toHaveLength(10);
  });

  it('함정은 한 건뿐이다', () => {
    expect(dept.cases.filter((c) => c.trap)).toHaveLength(1);
  });

  it('id가 겹치지 않는다', () => {
    const ids = [...dept.scenes.map((s) => s.id), ...dept.cases.map((c) => c.id), ...dept.columns.map((c) => c.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('조건에 쓰는 사실값은 필드 목록 안의 값이다', () => {
    const fields = new Map(dept.fields.map((f) => [f.id, f.values]));
    const clauses = [...dept.initialRule.clauses, dept.initialHandoff.clause, dept.fixedHandoff.clause];
    for (const cl of clauses) expect(fields.get(cl.field)).toContain(cl.value);
    for (const c of dept.cases) {
      for (const [k, v] of Object.entries(c.facts)) expect(fields.get(k)).toContain(v);
    }
  });

  it('표에 보이는 열은 모든 건에 값이 있다', () => {
    for (const col of dept.columns.filter((c) => c.inTable && c.id !== 'sentence')) {
      for (const c of dept.cases) expect(c.cells[col.id], `${c.id}.${col.id}`).toBeTruthy();
    }
  });

  it('오늘 두 개, 나중 한 개를 고를 만큼 열이 있다', () => {
    expect(dept.columns.length).toBeGreaterThanOrEqual(3);
  });

  it('칩이 다섯 칸과 네 스티커 종류를 모두 채운다', () => {
    for (const list of [...Object.values(dept.chips.asis), ...Object.values(dept.chips.tobe), ...Object.values(dept.chips.problem)]) {
      expect(list.length).toBeGreaterThan(0);
    }
  });
});
