import { ChipInput } from '../components/ChipInput';
import { StepShell } from '../components/StepShell';
import { photoBackground } from '../content/sites';
import { MIN_SHORT } from '../state/gates';
import { useDept, useProgress } from '../state/ProgressContext';

export function WorkStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  return (
    <StepShell
      step="work"
      lead="오전 장면 여덟 개를 읽고, 이 부서가 하는 일을 세 줄로 적으세요."
      todo="세 줄을 모두 채우세요"
    >
      <div className="hero" style={{ backgroundImage: photoBackground('mart') }}>
        <div className="hero-text">{dept.name} · 금요일 오전</div>
      </div>
      <div className="feed">
        {dept.scenes.map((scene) => (
          <article key={scene.id} className="post">
            <span className="post-time">{scene.time}</span>
            <p className="post-text">{scene.text}</p>
          </article>
        ))}
      </div>
      <h2>이 부서가 하는 일</h2>
      {state.work.map((line, i) => (
        <ChipInput
          key={i}
          label={`${i + 1}번째 일`}
          value={line}
          min={MIN_SHORT}
          chips={[dept.chips.work[i]].filter(Boolean)}
          onChange={(v) => update((s) => ({ ...s, work: s.work.map((x, j) => (j === i ? v : x)) }))}
        />
      ))}
    </StepShell>
  );
}
