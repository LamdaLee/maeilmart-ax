/*
 * 본 화면(바탕화면 + 브라우저)에 들어가기 전, 화면 가득 보여 주는 도입부.
 * 상황과 진행 방법만 설명한다. 용어(As-is, Pain point …)는 여기서도 먼저 가르치지 않는다.
 */

export const INTRO_COVER = {
  kicker: '매일마트 AX 실습',
  title: ['오늘, 당신은', '매일마트에 출근합니다.'],
  body: '강사 없이, 혼자서, 하루 안에. 동네 마트의 실제 일을 따라가며 AI를 어디에 맡기고 어디에 사람을 남길지 직접 정해 봅니다.',
};

export const INTRO_COMPANY = {
  kicker: '회사 소개',
  title: '동네 마트 다섯 곳과\n온라인 주문',
  stats: [
    { value: '5', unit: '곳', label: '동네 매장' },
    { value: '40', unit: '명', label: '직원' },
    { value: '3', unit: '개', label: '오늘 열린 부서' },
  ],
  body: '오늘은 금요일 오전. 주말을 앞두고 가장 바쁜 시간입니다.',
};

export const INTRO_DEPARTMENTS = {
  kicker: '오늘의 자리',
  title: '부서 하나를 골라, 그 부서의 오전을 따라갑니다.',
  body: '다른 부서는 끝난 뒤 같은 순서로 다시 해 볼 수 있어요.',
};

export const INTRO_JOURNEY = {
  kicker: '오늘의 흐름',
  title: '이렇게 흘러갑니다',
  steps: [
    { title: '장면 보기', line: '오전에 실제로 일어난 일을 읽어요' },
    { title: '아픈 곳 찾기', line: '반복·기다림·실수·사람만, 스티커를 붙여요' },
    { title: '앞으로의 흐름', line: '칸마다 사람·규칙·AI·자료 중 누가 할지 골라요' },
    { title: '10건 실행', line: '조건대로 흘려 보고, 사람 손에 남을 곳을 확인해요' },
  ],
  note: '일의 이름은 직접 해 본 다음에 알려 드려요.',
};

export const INTRO_HOWTO = {
  kicker: '진행 방법',
  title: '어렵지 않아요',
  tips: [
    { title: '칩을 누르면 채워져요', line: '예시 문장이 칸에 들어가요. 내 말로 고쳐 써도 됩니다.' },
    { title: '채우면 다음이 켜져요', line: '그 페이지에서 할 일을 마치면 "다음" 버튼이 파랗게 켜집니다.' },
    { title: '이 브라우저에 저장돼요', line: '계정도, 외부 AI도 쓰지 않아요. 창을 닫아도 이어서 할 수 있어요.' },
    { title: '약 3시간', line: '칩으로 빠르게 가면 세 시간, 문장을 고치며 가면 하루 안에 끝나요.' },
  ],
};

export const INTRO_QUESTIONS = {
  kicker: '끝에서 답할 질문',
  title: '오늘 끝까지 가져갈 질문 두 개',
  body: '지금은 답하지 않아요. 마지막 페이지에서 내 문장으로 답합니다.',
};

/** 소개 장면 수 (마지막 로그인 화면 포함) */
export const INTRO_SLIDES = 7;
