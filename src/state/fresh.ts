import { getDepartment, isDepartmentId } from '../content/departments';
import { SLOTS } from '../content/steps';
import type {
  Actor,
  AutoRule,
  Clause,
  ColumnMode,
  CourseState,
  DepartmentId,
  Handoff,
  Route,
  Slots,
  StickerKind,
  TaskCard,
} from '../types';

export const STORAGE_KEY = 'maeilmart-ax-v1';
export const WORK_LINES = 3;
export const MAX_RULE_CLAUSES = 2;

const emptySlots = <T,>(value: T): Slots<T> =>
  Object.fromEntries(SLOTS.map((s) => [s.id, value])) as Slots<T>;

const EMPTY_CLAUSE: Clause = { field: '', value: '' };

export function fresh(): CourseState {
  return {
    version: 1,
    started: false,
    department: null,
    work: Array(WORK_LINES).fill(''),
    asis: emptySlots(''),
    stickers: {},
    problem: '',
    painSlot: null,
    dataProblem: '',
    bx: '',
    ax: '',
    tobe: emptySlots(''),
    improve: '',
    actors: emptySlots<Actor | null>(null),
    taskCard: null,
    taskConfirmed: false,
    columnMode: {},
    caseEdit: null,
    rule: { clauses: [] },
    handoff: { clause: { ...EMPTY_CLAUSE }, to: 'human' },
    runCount: 0,
    lastRun: null,
    answers: { first: '', second: '' },
    revealed: false,
  };
}

/**
 * 부서를 정하거나 바꾼다. 부서 뒤의 모든 답을 지우고 그 부서의 초기 규칙과 넘김 조건을 넣는다.
 * 같은 부서를 다시 고르면 아무것도 지우지 않는다.
 */
export function withDepartment(s: CourseState, id: DepartmentId): CourseState {
  if (s.department === id) return s;
  const dept = getDepartment(id);
  if (!dept) return s;
  const base = fresh();
  return {
    ...base,
    started: s.started,
    department: id,
    rule: structuredClone(dept.initialRule),
    handoff: structuredClone(dept.initialHandoff),
  };
}

/** 부서를 바꾸면 지워질 내용이 있는가. 확인 창을 띄울지 정할 때 쓴다. */
export function hasProgressAfterDepartment(s: CourseState): boolean {
  if (!s.department) return false;
  const blank = withDepartment({ ...fresh(), started: s.started }, s.department);
  return JSON.stringify(s) !== JSON.stringify(blank);
}

// ---------------------------------------------------------------- hydrate

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const SLOT_IDS = SLOTS.map((s) => s.id) as string[];
const ACTOR_IDS: Actor[] = ['Human', 'Rule', 'AI', 'Data'];
const STICKER_IDS: StickerKind[] = ['repeat', 'wait', 'mistake', 'humanOnly'];
const ROUTES: Route[] = ['auto', 'human', 'data'];
const MODES: ColumnMode[] = ['today', 'later', 'drop'];

function isSlots<T>(v: unknown, check: (x: unknown) => x is T): v is Slots<T> {
  return isObj(v) && SLOT_IDS.every((id) => check(v[id])) && Object.keys(v).length === SLOT_IDS.length;
}

function isRecordOf<T>(v: unknown, check: (x: unknown) => x is T): v is Record<string, T> {
  return isObj(v) && Object.values(v).every(check);
}

const isClause = (v: unknown): v is Clause => isObj(v) && isStr(v.field) && isStr(v.value);
const isRule = (v: unknown): v is AutoRule =>
  isObj(v) && Array.isArray(v.clauses) && v.clauses.length <= MAX_RULE_CLAUSES && v.clauses.every(isClause);
const isHandoff = (v: unknown): v is Handoff =>
  isObj(v) && isClause(v.clause) && (v.to === 'human' || v.to === 'data');
const isActorOrNull = (v: unknown): v is Actor | null => v === null || ACTOR_IDS.includes(v as Actor);
const isSticker = (v: unknown): v is StickerKind => STICKER_IDS.includes(v as StickerKind);
const isMode = (v: unknown): v is ColumnMode => MODES.includes(v as ColumnMode);
const isRoute = (v: unknown): v is Route => ROUTES.includes(v as Route);
const isTaskCard = (v: unknown): v is TaskCard =>
  isObj(v) && ['task', 'bx', 'ax', 'pain', 'asis', 'tobe', 'materials', 'human'].every((k) => isStr(v[k]));

function isCourseState(v: unknown): v is CourseState {
  if (!isObj(v) || v.version !== 1) return false;
  if (!(v.department === null || isDepartmentId(v.department))) return false;
  if (!Array.isArray(v.work) || v.work.length !== WORK_LINES || !v.work.every(isStr)) return false;
  if (!isSlots(v.asis, isStr) || !isSlots(v.tobe, isStr) || !isSlots(v.actors, isActorOrNull)) return false;
  if (!isRecordOf(v.stickers, isSticker) || !isRecordOf(v.columnMode, isMode)) return false;
  if (!(v.painSlot === null || SLOT_IDS.includes(v.painSlot as string))) return false;
  if (![v.problem, v.dataProblem, v.bx, v.ax, v.improve].every(isStr)) return false;
  if (![v.started, v.taskConfirmed, v.revealed].every(isBool)) return false;
  if (!(v.taskCard === null || isTaskCard(v.taskCard))) return false;
  if (!(v.caseEdit === null || (isObj(v.caseEdit) && isStr(v.caseEdit.id) && isStr(v.caseEdit.text)))) return false;
  if (!isRule(v.rule) || !isHandoff(v.handoff)) return false;
  if (typeof v.runCount !== 'number' || !Number.isInteger(v.runCount) || v.runCount < 0) return false;
  if (
    !(
      v.lastRun === null ||
      (isObj(v.lastRun) &&
        isStr(v.lastRun.key) &&
        isBool(v.lastRun.trapOk) &&
        isRecordOf(v.lastRun.routes, isRoute) &&
        isObj(v.lastRun.counts) &&
        ROUTES.every((r) => typeof (v.lastRun as { counts: Record<string, unknown> }).counts[r] === 'number'))
    )
  )
    return false;
  if (!isObj(v.answers) || !isStr(v.answers.first) || !isStr(v.answers.second)) return false;
  return true;
}

/** 부서 데이터와 맞지 않는 값(없는 장면·열·건 id)을 걸러 낸다. 형태는 이미 검사된 상태다. */
function pruneToDepartment(s: CourseState): CourseState {
  const dept = getDepartment(s.department);
  if (!dept) return s.department === null ? { ...fresh(), started: s.started } : fresh();
  const sceneIds = new Set(dept.scenes.map((x) => x.id));
  const columnIds = new Set(dept.columns.map((x) => x.id));
  const editable = new Set(dept.cases.filter((x) => !x.trap).map((x) => x.id));
  return {
    ...s,
    stickers: Object.fromEntries(Object.entries(s.stickers).filter(([id]) => sceneIds.has(id))),
    columnMode: Object.fromEntries(Object.entries(s.columnMode).filter(([id]) => columnIds.has(id))),
    caseEdit: s.caseEdit && editable.has(s.caseEdit.id) ? s.caseEdit : null,
  };
}

/** 저장된 문자열을 상태로 되돌린다. 읽을 수 없거나 형태가 깨졌으면 새 과정으로 시작한다. */
export function hydrate(raw: string | null): CourseState {
  if (!raw) return fresh();
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCourseState(parsed) ? pruneToDepartment(parsed) : fresh();
  } catch {
    return fresh();
  }
}
