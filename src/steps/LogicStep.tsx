import { LogicForm } from '../components/LogicForm';
import { StepShell } from '../components/StepShell';

export function LogicStep() {
  return (
    <StepShell
      step="logic"
      lead="조건은 위에서부터 차례로 봅니다. 처음 조건이 채워져 있으니, 그대로 실행해 봐도 돼요."
      todo="자동 조건이 한 줄은 있어야 해요"
    >
      <LogicForm />
    </StepShell>
  );
}
