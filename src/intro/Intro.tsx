import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { DEPARTMENTS } from '../content/departments';
import {
  INTRO_COMPANY,
  INTRO_COVER,
  INTRO_DEPARTMENTS,
  INTRO_HOWTO,
  INTRO_JOURNEY,
  INTRO_QUESTIONS,
  INTRO_SLIDES,
} from '../content/intro';
import { PHOTOS, photoBackground } from '../content/sites';
import { QUESTIONS } from '../content/steps';

const LAST = INTRO_SLIDES - 1;

/** 화면 가득 도입부. /intro/0 ~ /intro/6. 마지막은 회사 컴퓨터 로그인 화면이다. */
export function Intro() {
  const { slide } = useParams();
  const navigate = useNavigate();
  const index = Number(slide ?? 0);
  const [leaving, setLeaving] = useState(false);

  const go = useCallback((n: number) => navigate(`/intro/${Math.max(0, Math.min(LAST, n))}`), [navigate]);

  const login = useCallback(() => {
    setLeaving(true);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => navigate('/s/question'), reduce ? 0 : 650);
  }, [navigate]);

  // 다음 장면의 사진을 미리 받아 둔다.
  useEffect(() => {
    for (const src of [PHOTOS.office, PHOTOS.desk, PHOTOS.wallpaper]) new Image().src = src;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 엔터·스페이스는 초점이 있는 버튼이 직접 처리한다. 화살표는 언제나 장면을 넘긴다.
      const onControl = !!(e.target as HTMLElement).closest('button, a, input, textarea');
      if (e.key === 'ArrowRight' || (!onControl && (e.key === 'Enter' || e.key === ' '))) {
        e.preventDefault();
        if (index === LAST) login();
        else go(index + 1);
      }
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go, login]);

  if (!Number.isInteger(index) || index < 0 || index > LAST) return <Navigate to="/intro/0" replace />;

  if (index === LAST) return <LoginScreen onLogin={login} onBack={() => go(LAST - 1)} leaving={leaving} />;

  const next = () => go(index + 1);

  return (
    <div className="intro">
      <div key={index} className="intro-slide">
        {index === 0 && <Cover onNext={next} />}
        {index === 1 && <Company />}
        {index === 2 && <Departments />}
        {index === 3 && <Journey />}
        {index === 4 && <HowTo />}
        {index === 5 && <Questions />}
      </div>

      {index > 0 && (
        <nav className="intro-nav" aria-label="소개 넘기기">
          <button className="btn" onClick={() => go(index - 1)}>
            ← 이전
          </button>
          <div className="intro-dots" aria-label={`${LAST}장 중 ${index + 1}장`}>
            {Array.from({ length: LAST }, (_, i) => (
              <span key={i} className={i === index ? 'now' : i < index ? 'done' : ''} />
            ))}
          </div>
          <button className="btn btn-primary btn-large" onClick={next}>
            {index === LAST - 1 ? '회사 컴퓨터 켜기' : '다음'} →
          </button>
        </nav>
      )}

      {index < LAST && (
        <button className="intro-skip" onClick={() => go(LAST)}>
          소개 건너뛰기
        </button>
      )}
    </div>
  );
}

function Cover({ onNext }: { onNext: () => void }) {
  return (
    <section className="cover" style={{ backgroundImage: photoBackground('mart') }}>
      <div className="cover-inner">
        <p className="kicker kicker-light">{INTRO_COVER.kicker}</p>
        <h1 className="cover-title">
          {INTRO_COVER.title[0]}
          <br />
          <em>{INTRO_COVER.title[1]}</em>
        </h1>
        <p className="cover-body">{INTRO_COVER.body}</p>
        <button className="btn btn-primary btn-large" onClick={onNext} autoFocus>
          시작하기 →
        </button>
      </div>
    </section>
  );
}

function Company() {
  return (
    <section className="split">
      <div className="split-text">
        <p className="kicker">{INTRO_COMPANY.kicker}</p>
        <h1 className="intro-title">{INTRO_COMPANY.title}</h1>
        <div className="stats">
          {INTRO_COMPANY.stats.map((s) => (
            <div key={s.label} className="stat">
              <strong>
                {s.value}
                <small>{s.unit}</small>
              </strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <p className="intro-body">{INTRO_COMPANY.body}</p>
      </div>
      <div className="split-photo" style={{ backgroundImage: photoBackground('office') }} />
    </section>
  );
}

function Departments() {
  return (
    <section className="intro-center">
      <p className="kicker">{INTRO_DEPARTMENTS.kicker}</p>
      <h1 className="intro-title">{INTRO_DEPARTMENTS.title}</h1>
      <div className="intro-cards">
        {DEPARTMENTS.map((d, i) => (
          <div key={d.id} className="intro-card">
            <span className="intro-card-num">{i + 1}</span>
            <h2>{d.name}</h2>
            <p>오늘 {d.todayWork}</p>
          </div>
        ))}
      </div>
      <p className="intro-body">{INTRO_DEPARTMENTS.body}</p>
    </section>
  );
}

function Journey() {
  return (
    <section className="intro-center">
      <p className="kicker">{INTRO_JOURNEY.kicker}</p>
      <h1 className="intro-title">{INTRO_JOURNEY.title}</h1>
      <ol className="journey">
        {INTRO_JOURNEY.steps.map((s, i) => (
          <li key={s.title}>
            <span className="journey-num">{i + 1}</span>
            <h2>{s.title}</h2>
            <p>{s.line}</p>
          </li>
        ))}
      </ol>
      <p className="intro-body">{INTRO_JOURNEY.note}</p>
    </section>
  );
}

function HowTo() {
  return (
    <section className="split split-reverse">
      <div className="split-photo" style={{ backgroundImage: photoBackground('desk') }} />
      <div className="split-text">
        <p className="kicker">{INTRO_HOWTO.kicker}</p>
        <h1 className="intro-title">{INTRO_HOWTO.title}</h1>
        <div className="demo" aria-hidden>
          <span className="chip">배송 위치를 찾아 답한다</span>
          <span className="demo-arrow">→</span>
          <span className="demo-input">배송 위치를 찾아 답한다</span>
        </div>
        <ul className="tips">
          {INTRO_HOWTO.tips.map((t) => (
            <li key={t.title}>
              <h2>{t.title}</h2>
              <p>{t.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Questions() {
  return (
    <section className="intro-center">
      <p className="kicker">{INTRO_QUESTIONS.kicker}</p>
      <h1 className="intro-title">{INTRO_QUESTIONS.title}</h1>
      <div className="big-questions">
        <p>
          <span>1</span>
          {QUESTIONS.first}
        </p>
        <p>
          <span>2</span>
          {QUESTIONS.second}
        </p>
      </div>
      <p className="intro-body">{INTRO_QUESTIONS.body}</p>
    </section>
  );
}

function LoginScreen({ onLogin, onBack, leaving }: { onLogin: () => void; onBack: () => void; leaving: boolean }) {
  return (
    <div className={`login${leaving ? ' is-leaving' : ''}`} style={{ backgroundImage: photoBackground('wallpaper') }}>
      <div className="login-clock">
        <strong>9:00</strong>
        <span>금요일 오전</span>
      </div>
      <div className="login-card">
        <div className="login-avatar" aria-hidden>
          나
        </div>
        <h1>신입 사원</h1>
        <p>매일마트 · 오늘 첫 출근</p>
        <button className="btn btn-primary btn-large" onClick={onLogin} autoFocus disabled={leaving}>
          로그인 →
        </button>
        <button className="login-back" onClick={onBack}>
          ← 소개로 돌아가기
        </button>
      </div>
    </div>
  );
}
