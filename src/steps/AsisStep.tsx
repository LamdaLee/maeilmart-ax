import { SlotGrid } from '../components/SlotGrid';
import { StepShell } from '../components/StepShell';
import { useDept, useProgress } from '../state/ProgressContext';

export function AsisStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  return (
    <StepShell step="asis" lead="오늘 일이 지나가는 다섯 칸을 채우세요." todo="다섯 칸을 모두 채우세요">
      <SlotGrid
        values={state.asis}
        chips={dept.chips.asis}
        onChange={(slot, v) => update((s) => ({ ...s, asis: { ...s.asis, [slot]: v } }))}
      />
    </StepShell>
  );
}
