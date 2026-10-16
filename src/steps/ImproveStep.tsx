import { ChipInput } from '../components/ChipInput';
import { SlotGrid } from '../components/SlotGrid';
import { StepShell } from '../components/StepShell';
import { MIN_SENTENCE } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';

export function ImproveStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  return (
    <StepShell step="improve" lead="같은 다섯 칸에 앞으로의 흐름을 적으세요." todo="다섯 칸과 개선 한 줄을 채우세요">
      <div className="two-col">
        <div>
          <h2 style={{ marginTop: 0 }}>지금</h2>
          <SlotGrid values={state.asis} pain={state.painSlot} />
        </div>
        <div>
          <h2 style={{ marginTop: 0 }}>앞으로</h2>
          <SlotGrid
            values={state.tobe}
            chips={dept.chips.tobe}
            onChange={(slot, v) => update((s) => ({ ...s, tobe: { ...s.tobe, [slot]: v } }))}
          />
        </div>
      </div>
      <h2>무엇이 나아지나요?</h2>
      <ChipInput
        label="개선 한 줄"
        value={state.improve}
        min={MIN_SENTENCE}
        chips={dept.chips.improve}
        onChange={(v) => update((s) => ({ ...s, improve: v }))}
      />
    </StepShell>
  );
}
