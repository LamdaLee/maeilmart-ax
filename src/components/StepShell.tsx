import type { ReactNode } from 'react';
import { SITE_STYLE, SITES } from '../content/sites';
import { STEPS, stepIndex } from '../content/steps';
import { useProgress } from '../state/ProgressContext';
import { canLeave } from '../state/gates';
import type { StepId } from '../types';
import { useStepNav } from './useStepNav';

interface Props {
  step: StepId;
  /** 한 줄 안내. 줄글 대신 지금 할 일 하나만 적는다. */
  lead: ReactNode;
  /** 아직 다음으로 못 갈 때 아래에 보일 짧은 이유 */
  todo?: string;
  nextLabel?: string;
  /** 페이지 머리 대신 쓸 큰 사진 머리 (홈 화면) */
  hero?: ReactNode;
  children: ReactNode;
}

/** 각 웹페이지의 공통 틀: 사이트 머리, 진행 막대, 제목, 본문, 아래 이동 버튼. */
export function StepShell({ step, lead, todo, nextLabel, hero, children }: Props) {
  const { state, dept } = useProgress();
  const nav = useStepNav(step);
  const info = STEPS[stepIndex(step)];
  const site = SITES[step];
  const style = SITE_STYLE[site.kind];
  const index = stepIndex(step);
  const passed = step === 'question' || canLeave(step, state);

  return (
    <>
      {hero}

      <main className="page">
        <div className="page-meta">
          <span className="favicon" style={{ background: style.color }}>
            {style.mark}
          </span>
          {site.name}
          {dept && ` · ${dept.name}`}
          <span className="page-meta-step">
            {index + 1} / {STEPS.length}
          </span>
        </div>
        <h1>{info.title}</h1>
        <p className="lead">{lead}</p>
        {children}
      </main>

      <footer className="page-foot">
        <button className="btn" onClick={nav.goPrev} disabled={!nav.prev}>
          ← 이전
        </button>
        <span className={`foot-status${passed && nav.next ? ' ready' : ''}`}>
          {nav.next ? (passed ? '다음 페이지로 갈 수 있어요' : todo) : null}
        </span>
        {nav.next && (
          <button className="btn btn-primary" onClick={nav.goNext} disabled={!nav.canNext}>
            {nextLabel ?? '다음'} →
          </button>
        )}
      </footer>
    </>
  );
}
