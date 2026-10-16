import { ChipInput } from '../components/ChipInput';
import { StepShell } from '../components/StepShell';
import { MIN_SENTENCE } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';

export function GoalStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  return (
    <StepShell step="goal" lead="무엇이 달라질지 두 문장으로 적으세요." todo="두 문장을 모두 적으세요">
      <ChipInput
        label="가게와 손님에게 보일 변화"
        value={state.bx}
        min={MIN_SENTENCE}
        chips={dept.chips.bx}
        onChange={(v) => update((s) => ({ ...s, bx: v }))}
      />
      <ChipInput
        label="그 변화를 위해 오늘 맡길 판단"
        value={state.ax}
        min={MIN_SENTENCE}
        chips={dept.chips.ax}
        onChange={(v) => update((s) => ({ ...s, ax: v }))}
      />
    </StepShell>
  );
}
