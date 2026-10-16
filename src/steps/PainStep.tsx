import { StepShell } from '../components/StepShell';
import { SLOTS } from '../content/steps';
import { useProgress } from '../state/ProgressContext';

export function PainStep() {
  const { state, update } = useProgress();
  return (
    <StepShell step="pain" lead="이 문제가 지금 흐름의 어느 칸에서 생기나요?" todo="칸을 하나 고르세요">
      <div className="question">“{state.problem}”</div>
      <div className="flow" style={{ marginTop: 24 }}>
        {SLOTS.map((slot, i) => (
          <button
            key={slot.id}
            className={`slot${state.painSlot === slot.id ? ' selected' : ''}`}
            aria-pressed={state.painSlot === slot.id}
            onClick={() => update((s) => ({ ...s, painSlot: slot.id }))}
            style={{ textAlign: 'left' }}
          >
            <span className="slot-name">
              <span className="slot-num">{i + 1}</span>
              {slot.label}
              {state.painSlot === slot.id && <span className="pain-tag">아픈 칸</span>}
            </span>
            <span className="slot-text">{state.asis[slot.id]}</span>
          </button>
        ))}
      </div>
    </StepShell>
  );
}
