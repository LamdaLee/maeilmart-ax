import { useNavigate } from 'react-router-dom';
import { nextStep, prevStep } from '../content/steps';
import { useProgress } from '../state/ProgressContext';
import { canLeave } from '../state/gates';
import type { StepId } from '../types';

/** 브라우저 앞/뒤 버튼과 페이지 아래 버튼이 같은 이동 규칙을 쓰게 한다. */
export function useStepNav(step: StepId) {
  const navigate = useNavigate();
  const { state, update } = useProgress();
  const next = nextStep(step);
  const prev = prevStep(step);
  // 첫 화면은 답을 받지 않는다. 다음을 누르는 것이 곧 시작이다.
  const canNext = !!next && (step === 'question' || canLeave(step, state));

  return {
    prev,
    next,
    canNext,
    goPrev: () => prev && navigate(`/s/${prev}`),
    goNext: () => {
      if (!next || !canNext) return;
      if (step === 'question') update((s) => (s.started ? s : { ...s, started: true }));
      navigate(`/s/${next}`);
    },
  };
}
