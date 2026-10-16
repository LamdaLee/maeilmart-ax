import type { Actor, SlotId, StepId, StickerKind } from '../types';

export interface StepInfo {
  id: StepId;
  title: string;
  short: string;
  /** 통과한 뒤에만 보여 주는 이름. 이름을 먼저 가르치지 않는다. */
  concept?: { name: string; line: string };
}

export const STEPS: StepInfo[] = [
  { id: 'question', title: '오늘의 질문', short: '질문' },
  { id: 'department', title: '부서 고르기', short: '부서' },
  { id: 'work', title: '하는 일', short: '하는 일' },
  {
    id: 'asis',
    title: '지금 흐르는 일',
    short: '지금 흐름',
    concept: { name: 'As-is Process', line: '방금 채운 다섯 칸이 지금 일이 실제로 지나가는 순서, As\u2011is Process입니다.' },
  },
  {
    id: 'problem',
    title: '마찰 찾기',
    short: '마찰',
    concept: {
      name: '마찰 찾기',
      line: '반복, 기다림, 실수, 사람 병목처럼\n일이 걸리는 곳을 표시하는 일입니다.',
    },
  },
  {
    id: 'pain',
    title: 'Pain point 정하기',
    short: 'Pain point',
    concept: { name: 'Pain point', line: '흐름 가운데 문제가 생기는 한 칸입니다. 이 칸을 고치는 것이 오늘의 과제가 됩니다.' },
  },
  {
    id: 'data',
    title: '표만 먼저 보면',
    short: '표 보기',
    concept: { name: '데이터 입구', line: '장면 없이 표만 보고 문제를 찾는 길, 이것이 데이터 입구입니다.' },
  },
  {
    id: 'goal',
    title: '달라질 것',
    short: '목표',
    concept: {
      name: 'BX Goal · AX Goal',
      line: '가게에 보일 변화가 BX Goal, 그 변화를 위해 오늘 맡길 판단이 AX Goal입니다.',
    },
  },
  {
    id: 'improve',
    title: '앞으로의 흐름',
    short: '앞으로',
    concept: { name: 'To-Be Process', line: '같은 다섯 칸에 적은 앞으로의 흐름이 To\u2011Be Process입니다.' },
  },
  {
    id: 'actors',
    title: '누가 하나',
    short: '누가',
    concept: { name: '수행방식', line: '칸마다 Human·Rule·AI·Data 중 누가 하는지 붙인 것이 수행방식입니다.' },
  },
  {
    id: 'task',
    title: '한 장으로 모으기',
    short: '카드',
    concept: { name: '과제정의', line: '앞의 문장을 카드 한 장으로 모아 확정한 것이 과제정의입니다.' },
  },
  { id: 'columns', title: '필요한 데이터', short: '자료 열' },
  { id: 'cases', title: '오늘 자료', short: '10건' },
  { id: 'logic', title: '판단 조건', short: '조건' },
  {
    id: 'run',
    title: '실행',
    short: '실행',
    concept: { name: '워크플로우', line: '10건을 조건에 흘려 사람 손까지 보낸 것이 워크플로우입니다.' },
  },
  { id: 'answer', title: '나의 답', short: '나의 답' },
];

export const STEP_IDS = STEPS.map((s) => s.id);

export function stepIndex(id: StepId): number {
  return STEP_IDS.indexOf(id);
}

export function isStepId(value: string | undefined): value is StepId {
  return !!value && (STEP_IDS as string[]).includes(value);
}

export function nextStep(id: StepId): StepId | null {
  return STEP_IDS[stepIndex(id) + 1] ?? null;
}

export function prevStep(id: StepId): StepId | null {
  return STEP_IDS[stepIndex(id) - 1] ?? null;
}

export const SLOTS: { id: SlotId; label: string }[] = [
  { id: 'in', label: '들어옴' },
  { id: 'split', label: '나누기' },
  { id: 'judge', label: '판단' },
  { id: 'act', label: '처리' },
  { id: 'handoff', label: '에스컬레이션' },
];

export const SLOT_LABEL: Record<SlotId, string> = Object.fromEntries(SLOTS.map((s) => [s.id, s.label])) as Record<
  SlotId,
  string
>;

export const STICKERS: { id: StickerKind; label: string }[] = [
  { id: 'repeat', label: '반복' },
  { id: 'wait', label: '기다림' },
  { id: 'mistake', label: '실수' },
  { id: 'humanOnly', label: '사람 병목' },
];

export const ACTORS: { id: Actor; line: string }[] = [
  { id: 'Human', line: '사람이 직접 보고 정합니다. 예외, 감정, 책임이 걸린 곳에 남깁니다.' },
  { id: 'Rule', line: '정해 둔 조건에 맞으면 늘 같은 처리를 합니다. 조건 밖은 모릅니다.' },
  { id: 'AI', line: '문장을 읽고 뜻을 나누거나 초안을 씁니다. 최종 판단은 맡기지 않습니다.' },
  {
    id: 'Data',
    line: '예전 비슷한 사례를 찾아 보여 줍니다. 오늘 실습에서는 모델을 학습하지 않고, 기록을 보는 칸입니다.',
  },
];

export const QUESTIONS = {
  first: '회사 일을 바꿀 때, 문제가 먼저인가 데이터가 먼저인가?',
  second: '문제는 어떻게 찾는가?',
};
