import { StepShell } from '../components/StepShell';
import { PHOTOS } from '../content/sites';
import { QUESTIONS } from '../content/steps';

export function QuestionStep() {
  return (
    <StepShell
      step="question"
      lead="답은 아직 적지 않아요. 마지막 페이지에서 내 문장으로 답합니다."
      nextLabel="시작하기"
      hero={
        <div className="home-hero" style={{ backgroundImage: `url(${PHOTOS.mart})` }}>
          <div className="home-hero-text">
            <h1>매일마트</h1>
            <p>동네 마트 다섯 곳과 온라인 주문</p>
          </div>
        </div>
      }
    >
      <div className="facts">
        <span className="fact">매장 5곳</span>
        <span className="fact">온라인 주문</span>
        <span className="fact">직원 약 40명</span>
        <span className="fact">오늘은 금요일 오전</span>
      </div>
      <h2>오늘 끝까지 가져갈 질문 두 개</h2>
      <div className="question">1. {QUESTIONS.first}</div>
      <div className="question">2. {QUESTIONS.second}</div>
    </StepShell>
  );
}
