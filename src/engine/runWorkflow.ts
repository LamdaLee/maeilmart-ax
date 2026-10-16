import type { Actor, AutoRule, Case, Clause, Department, Handoff, Route, Slots } from '../types';

export interface RunInput {
  department: Department;
  rule: AutoRule;
  handoff: Handoff;
  actors: Slots<Actor | null>;
  caseEdit: { id: string; text: string } | null;
}

export interface RunRow {
  caseId: string;
  /** 화면에 보일 문장. 13단계에서 고친 건이면 고친 문장 */
  sentence: string;
  route: Route;
  text: string;
  trace: string[];
  expects: Route;
  ok: boolean;
  trap: boolean;
}

export interface RunResult {
  rows: RunRow[];
  counts: Record<Route, number>;
  trapOk: boolean;
  allOk: boolean;
}

/** 빈 절(field 또는 value가 비어 있음)은 어떤 건과도 맞지 않는다. */
export function isEmptyClause(clause: Clause): boolean {
  return !clause.field || !clause.value;
}

export function clauseMatches(clause: Clause, facts: Record<string, string>): boolean {
  if (isEmptyClause(clause)) return false;
  return facts[clause.field] === clause.value;
}

/** 자동 규칙은 절이 하나 이상 있고, 빈 절이 없고, 모든 절이 맞을 때만 맞는다. */
export function ruleMatches(rule: AutoRule, facts: Record<string, string>): boolean {
  if (rule.clauses.length === 0) return false;
  return rule.clauses.every((clause) => clauseMatches(clause, facts));
}

export const SPLIT_TRACE = '문장에서 의도를 나눴습니다';

/** 한 건을 판정한다. 우선순위: 넘김 조건 → 자동 규칙 → 부서 기본 처리. */
export function decide(c: Case, input: RunInput): Pick<RunRow, 'route' | 'text' | 'trace'> {
  const { department, rule, handoff, actors } = input;
  const trace: string[] = [];
  if (actors.split === 'AI') trace.push(SPLIT_TRACE);

  let route: Route;
  let text: string;
  if (clauseMatches(handoff.clause, c.facts)) {
    route = handoff.to;
    text = handoff.to === 'human' ? '사람에게 넘깁니다' : '예전 사례를 봅니다';
    trace.push(handoff.to === 'human' ? `Human · ${text}` : `Data · ${text}`);
  } else if (ruleMatches(rule, c.facts)) {
    route = 'auto';
    text = department.autoResult;
    trace.push(`Rule · ${text}`);
  } else {
    route = department.fallback.route;
    text = department.fallback.text;
    trace.push(`기본 처리 · ${text}`);
  }

  if (route === 'data' && c.past) trace.push(`비슷한 과거 · ${c.past}`);
  const hasAI = Object.values(actors).includes('AI');
  if (route === 'auto' && hasAI && c.draft) trace.push(`AI 초안 · ${c.draft}`);

  return { route, text, trace };
}

export function runWorkflow(input: RunInput): RunResult {
  const counts: Record<Route, number> = { auto: 0, human: 0, data: 0 };
  const rows = input.department.cases.map((c): RunRow => {
    const decided = decide(c, input);
    counts[decided.route] += 1;
    const edited = input.caseEdit && input.caseEdit.id === c.id && !c.trap ? input.caseEdit.text : null;
    return {
      caseId: c.id,
      sentence: edited ?? c.sentence,
      ...decided,
      expects: c.expects,
      ok: decided.route === c.expects,
      trap: !!c.trap,
    };
  });
  const trapRows = rows.filter((r) => r.trap);
  return {
    rows,
    counts,
    trapOk: trapRows.length > 0 && trapRows.every((r) => r.ok),
    allOk: rows.every((r) => r.ok),
  };
}
