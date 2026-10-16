import type { CourseState, Department, TaskCard } from '../types';
import { SLOTS, SLOT_LABEL } from './steps';

export const TASK_FIELDS: { id: keyof TaskCard; label: string }[] = [
  { id: 'task', label: '과제' },
  { id: 'bx', label: 'BX Goal' },
  { id: 'ax', label: 'AX Goal' },
  { id: 'pain', label: 'Pain point' },
  { id: 'asis', label: 'As-is' },
  { id: 'tobe', label: 'To-Be' },
  { id: 'materials', label: '넣을 자료' },
  { id: 'human', label: '사람이 남는 곳' },
];

/** 앞 단계 문장으로 과제 카드를 조립한다. 학습자가 고치기 전까지 매번 다시 만든다. */
export function buildTask(s: CourseState, dept: Department): TaskCard {
  const painLabel = s.painSlot ? SLOT_LABEL[s.painSlot] : '';
  const humanSlots = SLOTS.filter((slot) => s.actors[slot.id] === 'Human');
  return {
    task: s.problem && painLabel ? `${painLabel} 칸에서 "${s.problem}"를 줄인다` : s.problem,
    bx: s.bx,
    ax: s.ax,
    pain: painLabel ? `${painLabel} · ${s.problem}` : '',
    asis: SLOTS.map((slot) => s.asis[slot.id]).join(' → '),
    tobe: SLOTS.map((slot) => s.tobe[slot.id]).join(' → '),
    materials: dept.materials,
    human: humanSlots.map((slot) => `${slot.label}: ${s.tobe[slot.id]}`).join(' / '),
  };
}

export function currentTask(s: CourseState, dept: Department): TaskCard {
  return s.taskCard ?? buildTask(s, dept);
}
