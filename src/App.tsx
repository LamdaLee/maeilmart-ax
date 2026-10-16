import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Desktop } from './components/Desktop';
import { isStepId } from './content/steps';
import { Intro } from './intro/Intro';
import { useProgress } from './state/ProgressContext';
import { canEnter, firstIncomplete } from './state/gates';
import { SCREENS } from './steps/registry';
import type { CourseState } from './types';

/** 아직 시작하지 않았으면 도입부부터, 시작했으면 첫 미완료 단계로. */
function resumePath(state: CourseState): string {
  return state.started ? `/s/${firstIncomplete(state)}` : '/intro/0';
}

function StepRoute() {
  const { stepId } = useParams();
  const { state } = useProgress();
  if (!isStepId(stepId)) return <Navigate to={resumePath(state)} replace />;
  // 질문 페이지는 도입부의 로그인 뒤 첫 화면이라 언제나 열린다.
  // 그 뒤 단계는 앞 단계를 통과해야 열리고, 아니면 이어서 할 곳으로 돌려보낸다.
  if (stepId !== 'question' && !canEnter(stepId, state)) return <Navigate to={resumePath(state)} replace />;
  const Screen = SCREENS[stepId];
  return (
    <Desktop step={stepId}>
      <Screen />
    </Desktop>
  );
}

function Resume() {
  const { state } = useProgress();
  return <Navigate to={resumePath(state)} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/intro/:slide" element={<Intro />} />
        <Route path="/intro" element={<Navigate to="/intro/0" replace />} />
        <Route path="/s/:stepId" element={<StepRoute />} />
        <Route path="*" element={<Resume />} />
      </Routes>
    </BrowserRouter>
  );
}
