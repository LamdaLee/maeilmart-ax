import { ChipInput } from '../components/ChipInput';
import { StepShell } from '../components/StepShell';
import { currentTask, TASK_FIELDS } from '../content/task';
import { MIN_SHORT } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';

export function TaskStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  const card = currentTask(state, dept);
  const complete = TASK_FIELDS.every((f) => card[f.id].trim().length >= MIN_SHORT);

  return (
    <StepShell
      step="task"
      lead="앞에서 쓴 문장이 카드 한 장에 모였어요. 고칠 곳을 고친 뒤 확정하세요."
      todo={complete ? '"이 카드로 확정"을 누르세요' : '빈 칸을 채우세요'}
    >
      <div className="report">
        {TASK_FIELDS.map((f) => (
          <ChipInput
            key={f.id}
            label={f.label}
            value={card[f.id]}
            rows={f.id === 'asis' || f.id === 'tobe' ? 3 : 1}
            onChange={(v) =>
              update((s) => ({ ...s, taskCard: { ...currentTask(s, dept), [f.id]: v }, taskConfirmed: false }))
            }
          />
        ))}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            disabled={!complete || state.taskConfirmed}
            onClick={() => update((s) => ({ ...s, taskCard: currentTask(s, dept), taskConfirmed: true }))}
          >
            이 카드로 확정
          </button>
          {state.taskConfirmed && <strong style={{ color: 'var(--ok)' }}>✓ 확정했어요</strong>}
        </div>
      </div>
    </StepShell>
  );
}
