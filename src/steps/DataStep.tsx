import { CaseSheet } from '../components/CaseSheet';
import { ChipInput } from '../components/ChipInput';
import { StepShell } from '../components/StepShell';
import { MIN_SENTENCE } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';

export function DataStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  return (
    <StepShell step="data" lead="장면은 잊고, 이 표만 보세요. 어떤 문제가 보이나요?" todo="표에서 보이는 문제를 적으세요">
      <CaseSheet dept={dept} />
      <h2>표에서 보이는 문제</h2>
      <ChipInput
        label="한 문장"
        value={state.dataProblem}
        min={MIN_SENTENCE}
        rows={2}
        onChange={(v) => update((s) => ({ ...s, dataProblem: v }))}
      />
    </StepShell>
  );
}
