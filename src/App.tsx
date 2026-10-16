import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Desktop } from './components/Desktop';
import { isStepId } from './content/steps';
import { useProgress } from './state/ProgressContext';
import { canEnter, firstIncomplete } from './state/gates';
import { SCREENS } from './steps/registry';

function StepRoute() {
  const { stepId } = useParams();
  const { state } = useProgress();
  // 앞 단계를 통과하지 않은 주소로 들어오면 첫 미완료 단계로 돌려보낸다.
  if (!isStepId(stepId) || !canEnter(stepId, state)) {
    return <Navigate to={`/s/${firstIncomplete(state)}`} replace />;
  }
  const Screen = SCREENS[stepId];
  return (
    <Desktop step={stepId}>
      <Screen />
    </Desktop>
  );
}

function Resume() {
  const { state } = useProgress();
  return <Navigate to={`/s/${firstIncomplete(state)}`} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/s/:stepId" element={<StepRoute />} />
        <Route path="*" element={<Resume />} />
      </Routes>
    </BrowserRouter>
  );
}
