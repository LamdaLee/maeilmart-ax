import { getDepartment } from '../content/departments';
import { MIN_STICKERS, topKinds } from '../content/friction';
import { SLOTS, STEP_IDS, stepIndex } from '../content/steps';
import { currentTask, TASK_FIELDS } from '../content/task';
import { runWorkflow, type RunResult } from '../engine/runWorkflow';
import type { CourseState, Department, StepId } from '../types';

export const MIN_SHORT = 2;
export const MIN_SENTENCE = 8;

const filled = (v: string, min: number) => v.trim().length >= min;

/** 실행 통과를 판정할 때 비교하는 스냅샷. 이 값이 바뀌면 다시 실행해야 한다. */
export function runKey(s: CourseState): string {
  return JSON.stringify({
    d: s.department,
    rule: s.rule,
    handoff: s.handoff,
    edit: s.caseEdit,
    actors: s.actors,
  });
}

export function runNow(s: CourseState, dept: Department): RunResult {
  return runWorkflow({ department: dept, rule: s.rule, handoff: s.handoff, actors: s.actors, caseEdit: s.caseEdit });
}

export function runPassed(s: CourseState): boolean {
  return !!s.lastRun && s.lastRun.key === runKey(s) && s.lastRun.trapOk;
}

/** 그 단계의 다음 버튼을 누를 수 있는가. 화면은 이 함수를 복제하지 않는다. */
export function canLeave(step: StepId, s: CourseState): boolean {
  if (step === 'question') return s.started;
  const dept = getDepartment(s.department);
  if (!dept) return false;

  switch (step) {
    case 'department':
      return true;
    case 'work':
      return s.work.every((line) => filled(line, MIN_SHORT));
    case 'asis':
      return SLOTS.every((slot) => filled(s.asis[slot.id], MIN_SHORT));
    case 'problem': {
      if (Object.keys(s.stickers).length < MIN_STICKERS) return false;
      if (topKinds(s.stickers).length === 0) return false;
      return filled(s.problem, MIN_SENTENCE);
    }
    case 'pain':
      return s.painSlot !== null;
    case 'data':
      return filled(s.dataProblem, MIN_SENTENCE);
    case 'goal':
      return filled(s.bx, MIN_SENTENCE) && filled(s.ax, MIN_SENTENCE);
    case 'improve':
      return SLOTS.every((slot) => filled(s.tobe[slot.id], MIN_SHORT)) && filled(s.improve, MIN_SENTENCE);
    case 'actors': {
      const actors = SLOTS.map((slot) => s.actors[slot.id]);
      if (actors.some((a) => a === null)) return false;
      const humans = actors.filter((a) => a === 'Human').length;
      return humans > 0 && humans < actors.length;
    }
    case 'task': {
      if (!s.taskConfirmed) return false;
      const card = currentTask(s, dept);
      return TASK_FIELDS.every((f) => filled(card[f.id], MIN_SHORT));
    }
    case 'columns': {
      const modes = dept.columns.map((col) => s.columnMode[col.id]);
      if (modes.some((m) => !m)) return false;
      return modes.filter((m) => m === 'today').length >= 2 && modes.filter((m) => m === 'later').length >= 1;
    }
    case 'cases': {
      if (!s.caseEdit) return false;
      const target = dept.cases.find((c) => c.id === s.caseEdit!.id);
      if (!target || target.trap) return false;
      const text = s.caseEdit.text.trim();
      return text.length > 0 && text !== target.sentence;
    }
    case 'logic':
      return s.rule.clauses.length > 0 && s.rule.clauses.length <= 2;
    case 'run':
      return runPassed(s);
    case 'answer':
      return s.revealed;
  }
}

/** 앞 단계가 모두 통과했을 때만 그 단계 주소에 들어갈 수 있다. */
export function canEnter(step: StepId, s: CourseState): boolean {
  return STEP_IDS.slice(0, stepIndex(step)).every((id) => canLeave(id, s));
}

/** 아직 통과하지 않은 첫 단계. 모두 통과했으면 마지막 단계. */
export function firstIncomplete(s: CourseState): StepId {
  return STEP_IDS.find((id) => !canLeave(id, s)) ?? STEP_IDS[STEP_IDS.length - 1];
}
