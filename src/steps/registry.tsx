import type { ComponentType } from 'react';
import type { StepId } from '../types';
import { ActorsStep } from './ActorsStep';
import { AnswerStep } from './AnswerStep';
import { AsisStep } from './AsisStep';
import { CasesStep } from './CasesStep';
import { ColumnsStep } from './ColumnsStep';
import { DataStep } from './DataStep';
import { DepartmentStep } from './DepartmentStep';
import { GoalStep } from './GoalStep';
import { ImproveStep } from './ImproveStep';
import { LogicStep } from './LogicStep';
import { PainStep } from './PainStep';
import { ProblemStep } from './ProblemStep';
import { QuestionStep } from './QuestionStep';
import { RunStep } from './RunStep';
import { TaskStep } from './TaskStep';
import { WorkStep } from './WorkStep';

export const SCREENS: Record<StepId, ComponentType> = {
  question: QuestionStep,
  department: DepartmentStep,
  work: WorkStep,
  asis: AsisStep,
  problem: ProblemStep,
  pain: PainStep,
  data: DataStep,
  goal: GoalStep,
  improve: ImproveStep,
  actors: ActorsStep,
  task: TaskStep,
  columns: ColumnsStep,
  cases: CasesStep,
  logic: LogicStep,
  run: RunStep,
  answer: AnswerStep,
};
