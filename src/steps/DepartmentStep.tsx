import { StepShell } from '../components/StepShell';
import { DEPARTMENTS } from '../content/departments';
import { hasProgressAfterDepartment, withDepartment } from '../state/fresh';
import { useProgress } from '../state/ProgressContext';
import type { DepartmentId } from '../types';

export function DepartmentStep() {
  const { state, dept, update } = useProgress();

  const choose = (id: DepartmentId) => {
    if (state.department === id) return;
    if (hasProgressAfterDepartment(state) && !window.confirm('부서를 바꾸면 지금까지 적은 기록이 지워집니다. 바꿀까요?')) return;
    update((s) => withDepartment(s, id));
  };

  return (
    <StepShell step="department" lead="오늘 따라갈 부서를 하나 고르세요." todo="부서 카드를 하나 고르세요">
      <div className="cards">
        {DEPARTMENTS.map((d) => (
          <button
            key={d.id}
            className={`card${state.department === d.id ? ' selected' : ''}`}
            onClick={() => choose(d.id)}
            aria-pressed={state.department === d.id}
          >
            <h3>{d.name}</h3>
            <p>{d.summary}</p>
          </button>
        ))}
      </div>
      {dept && (
        <div className="notice info" style={{ marginTop: 24 }}>
          이 부서는 오늘 {dept.todayWork}을 합니다.
        </div>
      )}
    </StepShell>
  );
}
