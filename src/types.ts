export type DepartmentId = 'cs' | 'stock' | 'store';

export type StepId =
  | 'question'
  | 'department'
  | 'work'
  | 'asis'
  | 'problem'
  | 'pain'
  | 'data'
  | 'goal'
  | 'improve'
  | 'actors'
  | 'task'
  | 'columns'
  | 'cases'
  | 'logic'
  | 'run'
  | 'answer';

/** As-is와 To-Be가 함께 쓰는 다섯 칸. 칸 이름은 고정이고 학습자는 칸 안의 문장만 적는다. */
export type SlotId = 'in' | 'split' | 'judge' | 'act' | 'handoff';

export type Actor = 'Human' | 'Rule' | 'AI' | 'Data';

export type StickerKind = 'repeat' | 'wait' | 'mistake' | 'humanOnly';

/** 한 건이 흘러가는 줄. auto = 자동 처리, human = 사람에게 에스컬레이션, data = 예전 사례를 봄 */
export type Route = 'auto' | 'human' | 'data';

export type ColumnMode = 'today' | 'later' | 'drop';

export type Slots<T> = Record<SlotId, T>;

/** 사실값 하나가 특정 값과 같은지 본다. field나 value가 비어 있으면 어떤 건과도 맞지 않는다. */
export interface Clause {
  field: string;
  value: string;
}

/** 자동 조건. 최대 두 절이며 모두 맞아야 한다. 결과 문장은 부서 데이터가 정한다. */
export interface AutoRule {
  clauses: Clause[];
}

/** Hand-off 조건. 한 절이며 목적지는 사람 또는 예전 사례. */
export interface Handoff {
  clause: Clause;
  to: 'human' | 'data';
}

export interface FactField {
  id: string;
  label: string;
  values: string[];
}

export interface Column {
  id: string;
  label: string;
  /** 7단계와 13단계의 10행 표에 보이는 열인가. 아니면 12단계에서만 고르는 후보 열이다. */
  inTable: boolean;
}

export interface Case {
  id: string;
  /** 13단계에서 학습자가 고칠 수 있는 첫 문장. 판단에는 쓰이지 않는다. */
  sentence: string;
  /** 표에 보이는 값. 열 id → 표시 문자열. `sentence` 열은 sentence(또는 수정본)로 채운다. */
  cells: Record<string, string>;
  /** 판단에 쓰는 사실값. 문장을 고쳐도 바뀌지 않는다. */
  facts: Record<string, string>;
  expects: Route;
  trap?: true;
  /** 예전 사례로 Hand-off 했을 때 보이는 비슷한 과거 */
  past?: string;
  /** 자동 처리 + 어딘가에 AI가 있을 때 보이는 초안 */
  draft?: string;
}

export interface Scene {
  id: string;
  time: string;
  text: string;
}

export interface DepartmentChips {
  work: string[];
  asis: Slots<string[]>;
  problem: Record<StickerKind, string[]>;
  bx: string[];
  ax: string[];
  tobe: Slots<string[]>;
  improve: string[];
}

export interface Department {
  id: DepartmentId;
  name: string;
  /** "이 부서는 오늘 ___을 한다"의 빈칸 */
  todayWork: string;
  /** 부서 카드에 보이는 한두 문장 */
  summary: string;
  scenes: Scene[];
  chips: DepartmentChips;
  fields: FactField[];
  columns: Column[];
  cases: Case[];
  /** 자동 규칙에 맞았을 때의 결과 문장 */
  autoResult: string;
  /** 어떤 조건에도 맞지 않을 때의 기본 처리 */
  fallback: { route: Route; text: string };
  initialRule: AutoRule;
  initialHandoff: Handoff;
  /** 함정이 어긋났을 때 실행 화면에 보이는 힌트 */
  trapHint: string;
  /** 힌트대로 고친 Hand-off 조건. 테스트가 이 값으로 10건 모두 맞는지 본다. */
  fixedHandoff: Handoff;
  /** 과제 카드의 "넣을 자료" 기본 문장 */
  materials: string;
}

export interface TaskCard {
  task: string;
  bx: string;
  ax: string;
  pain: string;
  asis: string;
  tobe: string;
  materials: string;
  human: string;
}

export interface RunRecord {
  /** 실행 당시 부서·규칙·Hand-off·자료 수정·수행방식의 스냅샷 */
  key: string;
  routes: Record<string, Route>;
  counts: Record<Route, number>;
  trapOk: boolean;
}

export interface CourseState {
  version: 1;
  started: boolean;
  department: DepartmentId | null;
  work: string[];
  asis: Slots<string>;
  stickers: Record<string, StickerKind>;
  problem: string;
  painSlot: SlotId | null;
  dataProblem: string;
  bx: string;
  ax: string;
  tobe: Slots<string>;
  improve: string;
  actors: Slots<Actor | null>;
  /** null이면 앞 단계 문장으로 매번 조립한다. 한 칸이라도 고치면 고정된다. */
  taskCard: TaskCard | null;
  taskConfirmed: boolean;
  columnMode: Record<string, ColumnMode>;
  caseEdit: { id: string; text: string } | null;
  rule: AutoRule;
  handoff: Handoff;
  runCount: number;
  lastRun: RunRecord | null;
  answers: { first: string; second: string };
  revealed: boolean;
}
