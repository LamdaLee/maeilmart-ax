import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoBackground, SITE_STYLE, SITES, siteUrl } from '../content/sites';
import { STEPS, stepIndex } from '../content/steps';
import { useProgress } from '../state/ProgressContext';
import { canLeave } from '../state/gates';
import type { StepId } from '../types';
import { useStepNav } from './useStepNav';

const WINDOW_KEY = 'maeilmart-ax-window';

/** 저장된 선택이 없으면, 세로가 짧은 화면에서는 처음부터 화면 가득으로 연다. */
function loadMaximized(): boolean {
  try {
    const saved = localStorage.getItem(WINDOW_KEY);
    if (saved) return saved === 'max';
  } catch {
    // 읽지 못하면 화면 높이로만 정한다.
  }
  return window.innerHeight < 860;
}

/** 바탕화면 + 작업표시줄 + 브라우저 창. 단계가 바뀌면 다른 웹페이지로 넘어가듯 주소창과 탭이 바뀐다. */
export function Desktop({ step, children }: { step: StepId; children: ReactNode }) {
  const { state, dept, reset } = useProgress();
  const navigate = useNavigate();
  const nav = useStepNav(step);
  const site = SITES[step];
  const style = SITE_STYLE[site.kind];
  const info = STEPS[stepIndex(step)];
  const passed = canLeave(step, state);

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(false);
  const [maximized, setMaximized] = useState(loadMaximized);
  const [toast, setToast] = useState<StepId | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const wasPassed = useRef(passed);

  // 페이지가 바뀔 때: 로딩 막대, 맨 위로, 이전 알림 닫기
  useEffect(() => {
    setLoading(true);
    setToast(null);
    wasPassed.current = canLeave(step, state);
    viewport.current?.scrollTo({ top: 0 });
    const t = window.setTimeout(() => setLoading(false), 520);
    return () => window.clearTimeout(t);
  }, [step]);

  // 처음 통과하는 순간에만 그 일의 이름을 알림으로 보여 준다.
  useEffect(() => {
    if (passed && !wasPassed.current && info.concept) setToast(step);
    wasPassed.current = passed;
  }, [passed, step, info.concept]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 9000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    try {
      localStorage.setItem(WINDOW_KEY, maximized ? 'max' : 'window');
    } catch {
      // 저장하지 못해도 창 크기만 기억 못 할 뿐이다.
    }
  }, [maximized]);

  const index = stepIndex(step);
  const url = siteUrl(step, state.department);
  const [host, ...path] = url.split('/');
  const concept = toast ? STEPS[stepIndex(toast)].concept : undefined;

  const restart = () => {
    setMenu(false);
    if (window.confirm('처음부터 다시 할까요? 지금까지 적은 내용이 모두 지워집니다.')) {
      reset();
      navigate('/intro/0');
    }
  };

  return (
    <div
      className={`desktop${maximized ? ' maximized' : ''}`}
      style={{ '--wallpaper-image': photoBackground('wallpaper') } as CSSProperties}
    >
      <div className="wallpaper" aria-hidden />

      <div className="screen">
        <div className="browser" role="application" aria-label="브라우저">
          <div className="browser-tabs">
            <div className="window-dots">
              <span aria-hidden />
              <span aria-hidden />
              <button
                className="window-max"
                onClick={() => setMaximized((m) => !m)}
                aria-label={maximized ? '창 크기로' : '화면 가득'}
                title={maximized ? '창 크기로' : '화면 가득'}
              />
            </div>
            <div className="browser-tab">
              <span className="favicon" style={{ background: style.color }}>
                {style.mark}
              </span>
              {info.title} · {site.name}
            </div>
          </div>

          <div className="browser-bar">
            <button className="nav-btn" onClick={nav.goPrev} disabled={!nav.prev} aria-label="이전 페이지">
              ←
            </button>
            <button className="nav-btn" onClick={nav.goNext} disabled={!nav.canNext} aria-label="다음 페이지">
              →
            </button>
            <div className="address" aria-label="주소">
              <span className="address-lock" aria-hidden>
                ●
              </span>
              <span>
                <span className="address-host">{host}</span>
                {path.length > 0 && `/${path.join('/')}`}
              </span>
            </div>
            <button className="nav-btn" onClick={() => setMaximized((m) => !m)} aria-label={maximized ? '창 크기로' : '화면 가득'}>
              {maximized ? '⤡' : '⤢'}
            </button>
          </div>
          <div className="step-track" aria-label={`${STEPS.length}단계 중 ${index + 1}단계`}>
            {STEPS.map((s, i) => (
              <span key={s.id} className={i < index ? 'done' : i === index ? 'now' : ''} title={s.title} />
            ))}
            <div className={`loading-bar${loading ? ' is-loading' : ''}`} />
          </div>

          <div className="viewport" ref={viewport}>
            <div key={step} className="page-enter">
              {children}
            </div>
          </div>
        </div>
      </div>

      {concept && (
        <div className="toast" role="status">
          <button className="toast-close" onClick={() => setToast(null)} aria-label="알림 닫기">
            ×
          </button>
          <div className="toast-app">방금 한 일의 이름</div>
          <div className="toast-name">{concept.name}</div>
          <p className="toast-line">{concept.line}</p>
        </div>
      )}

      {menu && (
        <div className="taskbar-menu">
          <button onClick={() => navigate('/intro/1')}>소개 다시 보기</button>
          <button onClick={restart}>처음부터 다시 하기</button>
          <button onClick={() => setMenu(false)}>닫기</button>
        </div>
      )}

      <div className="taskbar">
        <button className="taskbar-start" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          <span className="favicon" style={{ background: SITE_STYLE.home.color }}>
            매
          </span>
          매일마트
        </button>
        <button className="taskbar-app" aria-current="page">
          <span className="favicon" style={{ background: style.color }}>
            {style.mark}
          </span>
          {site.name}
        </button>
        <div className="taskbar-spacer" />
        {dept && <span>{dept.name}</span>}
        <div className="taskbar-clock">
          <div>금요일</div>
          <div>오전 9:00</div>
        </div>
      </div>
    </div>
  );
}
