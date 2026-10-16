import { useNavigate } from 'react-router-dom';
import { ChipInput } from '../components/ChipInput';
import { ROUTE_LABEL } from '../components/CaseSheet';
import { StepShell } from '../components/StepShell';
import { REFERENCE } from '../content/reference';
import { QUESTIONS, SLOTS } from '../content/steps';
import { fresh } from '../state/fresh';
import { MIN_SENTENCE } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';
import type { Route } from '../types';

export function AnswerStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  const navigate = useNavigate();
  const ready = [state.answers.first, state.answers.second].every((a) => a.trim().length >= MIN_SENTENCE);
  const todayColumns = dept.columns.filter((c) => state.columnMode[c.id] === 'today').map((c) => c.label);
  const counts = state.lastRun?.counts;

  const again = () => {
    if (!window.confirm('기록을 지우고 다른 부서로 다시 시작할까요?')) return;
    update(() => ({ ...fresh(), started: true }));
    navigate('/s/department');
  };

  return (
    <StepShell step="answer" lead="처음의 두 질문에, 이제 내 문장으로 답하세요.">
      <div className="report">
        <ChipInput
          label={`1. ${QUESTIONS.first}`}
          value={state.answers.first}
          min={MIN_SENTENCE}
          rows={2}
          onChange={(v) => update((s) => ({ ...s, answers: { ...s.answers, first: v } }))}
        />
        <ChipInput
          label={`2. ${QUESTIONS.second}`}
          value={state.answers.second}
          min={MIN_SENTENCE}
          rows={2}
          onChange={(v) => update((s) => ({ ...s, answers: { ...s.answers, second: v } }))}
        />

        {state.revealed ? (
          <div className="reference">
            <h2>참고 답</h2>
            {[...REFERENCE.first, ...REFERENCE.second].map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ) : (
          <button className="btn btn-primary no-print" disabled={!ready} onClick={() => update((s) => ({ ...s, revealed: true }))}>
            참고 답 보기
          </button>
        )}

        <h2>오늘 만든 것</h2>
        <dl>
          <dt>부서</dt>
          <dd>{dept.name}</dd>
          <dt>BX Goal</dt>
          <dd>{state.bx}</dd>
          <dt>AX Goal</dt>
          <dd>{state.ax}</dd>
          <dt>앞으로의 흐름</dt>
          <dd>
            {SLOTS.map((slot) => (
              <div key={slot.id} className="summary-slot">
                <span className="summary-slot-head">
                  {slot.label} · {state.actors[slot.id]}
                </span>
                {state.tobe[slot.id]}
              </div>
            ))}
          </dd>
          <dt>오늘 쓴 자료 열</dt>
          <dd>{todayColumns.join(', ')}</dd>
          <dt>실행</dt>
          <dd>
            {state.runCount}번 실행
            {counts &&
              ` · ${(Object.keys(ROUTE_LABEL) as Route[])
                .filter((r) => counts[r] > 0)
                .map((r) => `${ROUTE_LABEL[r]} ${counts[r]}`)
                .join(', ')}`}
          </dd>
        </dl>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn" onClick={() => window.print()}>
          인쇄하기
        </button>
        <button className="btn" onClick={again}>
          다른 부서 해 보기
        </button>
      </div>
    </StepShell>
  );
}
