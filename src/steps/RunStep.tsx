import { CaseSheet, ROUTE_LABEL } from '../components/CaseSheet';
import { LogicForm } from '../components/LogicForm';
import { StepShell } from '../components/StepShell';
import { runKey, runNow, runPassed } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';
import type { Route } from '../types';

export function RunStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  const fresh = !!state.lastRun && state.lastRun.key === runKey(state);
  const result = fresh ? runNow(state, dept) : null;
  const passed = runPassed(state);

  const run = () =>
    update((s) => {
      const r = runNow(s, dept);
      return {
        ...s,
        runCount: s.runCount + 1,
        lastRun: {
          key: runKey(s),
          routes: Object.fromEntries(r.rows.map((row) => [row.caseId, row.route])),
          counts: r.counts,
          trapOk: r.trapOk,
        },
      };
    });

  const todo = !state.lastRun ? '"10건 실행"을 누르세요' : !fresh ? '조건이 바뀌었어요. 다시 실행하세요' : 'Hand\u2011off 조건을 고치고 다시 실행하세요';

  return (
    <StepShell step="run" lead="조건대로 10건을 흘려 보세요." todo={todo}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={run} disabled={fresh}>
          ▶ {state.runCount === 0 ? '10건 실행' : '다시 실행'}
        </button>
        <span className="field-hint">실행 {state.runCount}번</span>
      </div>

      {state.lastRun && !fresh && <div className="notice info">조건이 바뀌었어요. 다시 실행해야 결과가 맞춰집니다.</div>}

      {result && (
        <>
          <div className="counts">
            {(Object.keys(ROUTE_LABEL) as Route[]).map((r) => (
              <div key={r} className="count">
                <strong>{result.counts[r]}</strong>
                {ROUTE_LABEL[r]}
              </div>
            ))}
          </div>
          {passed ? (
            <div className="notice ok">✓ 사람이 봐야 할 건이 사람에게 갔어요. 경계가 맞게 그어졌습니다.</div>
          ) : (
            <div className="notice warn">⚠ {dept.trapHint}</div>
          )}
        </>
      )}

      {state.lastRun && !passed && <LogicForm only="handoff" />}

      {result && <CaseSheet dept={dept} caseEdit={state.caseEdit} rows={result.rows} />}
    </StepShell>
  );
}
