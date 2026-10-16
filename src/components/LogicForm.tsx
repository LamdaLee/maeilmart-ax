import { MAX_RULE_CLAUSES } from '../state/fresh';
import { useDept, useProgress } from '../state/ProgressContext';
import type { Clause, Department } from '../types';

function ClauseEditor({ clause, dept, onChange }: { clause: Clause; dept: Department; onChange: (c: Clause) => void }) {
  const field = dept.fields.find((f) => f.id === clause.field);
  return (
    <>
      <select
        className="select"
        aria-label="볼 열"
        value={clause.field}
        onChange={(e) => onChange({ field: e.target.value, value: '' })}
      >
        <option value="">열 고르기</option>
        {dept.fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <span>이(가)</span>
      <select
        className="select"
        aria-label="값"
        value={clause.value}
        disabled={!field}
        onChange={(e) => onChange({ ...clause, value: e.target.value })}
      >
        <option value="">값 고르기</option>
        {field?.values.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </>
  );
}

/** Hand-off 조건(한 절)과 자동 조건(최대 두 절) 편집. 모든 변경은 최신 상태를 받는 갱신으로 넣는다. */
export function LogicForm({ only }: { only?: 'handoff' }) {
  const { state, update } = useProgress();
  const dept = useDept();

  const setRuleClause = (i: number, c: Clause) =>
    update((s) => ({ ...s, rule: { clauses: s.rule.clauses.map((x, j) => (j === i ? c : x)) } }));

  return (
    <>
      <section className="rule-box">
        <h3>{'① 먼저 보는 조건 — Hand\u2011off'}</h3>
        <div className="rule-line">
          <span>만약</span>
          <ClauseEditor
            clause={state.handoff.clause}
            dept={dept}
            onChange={(c) => update((s) => ({ ...s, handoff: { ...s.handoff, clause: c } }))}
          />
          <span>이면</span>
          <select
            className="select"
            aria-label="넘길 곳"
            value={state.handoff.to}
            onChange={(e) => update((s) => ({ ...s, handoff: { ...s.handoff, to: e.target.value as 'human' | 'data' } }))}
          >
            <option value="human">사람에게 에스컬레이션</option>
            <option value="data">예전 사례 보기</option>
          </select>
        </div>
      </section>

      {only !== 'handoff' && (
        <section className="rule-box">
          <h3>② 그다음 조건 — 자동</h3>
          {state.rule.clauses.map((clause, i) => (
            <div className="rule-line" key={i}>
              <span>{i === 0 ? '만약' : '그리고'}</span>
              <ClauseEditor clause={clause} dept={dept} onChange={(c) => setRuleClause(i, c)} />
              <button
                type="button"
                className="btn btn-small"
                onClick={() => update((s) => ({ ...s, rule: { clauses: s.rule.clauses.filter((_, j) => j !== i) } }))}
              >
                빼기
              </button>
            </div>
          ))}
          {state.rule.clauses.length < MAX_RULE_CLAUSES && (
            <button
              type="button"
              className="btn btn-small"
              onClick={() =>
                update((s) =>
                  s.rule.clauses.length >= MAX_RULE_CLAUSES
                    ? s
                    : { ...s, rule: { clauses: [...s.rule.clauses, { field: '', value: '' }] } },
                )
              }
            >
              + 조건 더하기
            </button>
          )}
          <div className="rule-line" style={{ marginTop: 12 }}>
            <span>이면</span>
            <span className="then">{dept.autoResult}</span>
          </div>
        </section>
      )}

      {only !== 'handoff' && (
        <section className="rule-box">
          <h3>③ 어디에도 맞지 않으면 — 기본 처리</h3>
          <span className="then">{dept.fallback.text}</span>
        </section>
      )}
    </>
  );
}
