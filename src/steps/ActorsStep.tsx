import { StepShell } from '../components/StepShell';
import { ACTORS, SLOTS } from '../content/steps';
import { useProgress } from '../state/ProgressContext';

export function ActorsStep() {
  const { state, update } = useProgress();
  const chosen = SLOTS.map((s) => state.actors[s.id]);
  const humans = chosen.filter((a) => a === 'Human').length;
  const todo = chosen.includes(null)
    ? '다섯 칸 모두 고르세요'
    : humans === 0
      ? '사람(Human)이 남는 칸이 하나는 있어야 해요'
      : '전부 사람이면 바뀌는 것이 없어요';

  return (
    <StepShell step="actors" lead="앞으로의 칸마다, 누가 할지 고르세요." todo={todo}>
      {SLOTS.map((slot, i) => {
        const actor = state.actors[slot.id];
        return (
          <div key={slot.id} className="rule-box">
            <div className="slot-name" style={{ marginBottom: 6 }}>
              <span className="slot-num">{i + 1}</span>
              {slot.label}
            </div>
            <p style={{ margin: '0 0 12px' }}>{state.tobe[slot.id]}</p>
            <div className="segmented" role="radiogroup" aria-label={`${slot.label} 수행방식`}>
              {ACTORS.map((a) => (
                <button
                  key={a.id}
                  role="radio"
                  aria-checked={actor === a.id}
                  className={actor === a.id ? 'on' : ''}
                  onClick={() => update((s) => ({ ...s, actors: { ...s.actors, [slot.id]: a.id } }))}
                >
                  {a.id}
                </button>
              ))}
            </div>
            {actor && <p className="field-hint" style={{ margin: '10px 0 0' }}>{ACTORS.find((a) => a.id === actor)!.line}</p>}
          </div>
        );
      })}
    </StepShell>
  );
}
