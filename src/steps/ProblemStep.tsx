import { ChipInput } from '../components/ChipInput';
import { StepShell } from '../components/StepShell';
import { countStickers, MIN_STICKERS, topKinds } from '../content/friction';
import { STICKERS } from '../content/steps';
import { MIN_SENTENCE } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';
import type { StickerKind } from '../types';

export function ProblemStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  const placed = Object.keys(state.stickers).length;
  const counts = countStickers(state.stickers);
  const top = topKinds(state.stickers);
  const enough = placed >= MIN_STICKERS;

  const toggle = (sceneId: string, kind: StickerKind) =>
    update((s) => {
      const stickers = { ...s.stickers };
      if (stickers[sceneId] === kind) delete stickers[sceneId];
      else stickers[sceneId] = kind;
      return { ...s, stickers };
    });

  const todo = !enough ? `스티커를 ${MIN_STICKERS - placed}곳 더 붙이세요` : '문제를 한 문장으로 적으세요';

  return (
    <StepShell step="problem" lead="장면마다 스티커를 하나씩 붙이세요. 네 곳 이상이면 됩니다." todo={todo}>
      <div className="feed">
        {dept.scenes.map((scene) => (
          <article key={scene.id} className="post">
            <span className="post-time">{scene.time}</span>
            <div>
              <p className="post-text">{scene.text}</p>
              <div className="stickers">
                {STICKERS.map((k) => (
                  <button
                    key={k.id}
                    className={`sticker ${k.id}${state.stickers[scene.id] === k.id ? ' on' : ''}`}
                    aria-pressed={state.stickers[scene.id] === k.id}
                    onClick={() => toggle(scene.id, k.id)}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <h2>붙인 스티커 {placed}곳</h2>
      <div className="tally">
        {STICKERS.map((k) => (
          <span key={k.id} className={`tally-item${enough && top.includes(k.id) ? ' top' : ''}`}>
            {k.label} {counts[k.id]}
          </span>
        ))}
      </div>

      <h2>가장 많이 붙인 종류에서 문제 고르기</h2>
      {!enough && <div className="notice info">스티커를 네 곳 이상 붙이면 고를 수 있어요.</div>}
      <div className="chips" style={{ marginBottom: 16 }}>
        {STICKERS.flatMap((k) =>
          dept.chips.problem[k.id].map((chip) => (
            <button
              key={chip}
              className="chip"
              disabled={!enough || !top.includes(k.id)}
              onClick={() => update((s) => ({ ...s, problem: chip }))}
            >
              [{k.label}] {chip}
            </button>
          )),
        )}
      </div>
      <ChipInput
        label="문제 한 문장"
        value={state.problem}
        min={MIN_SENTENCE}
        readOnly={!enough}
        onChange={(v) => update((s) => ({ ...s, problem: v }))}
      />
    </StepShell>
  );
}
