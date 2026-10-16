import { StepShell } from '../components/StepShell';
import { useDept, useProgress } from '../state/ProgressContext';
import type { ColumnMode } from '../types';

const MODES: { id: ColumnMode; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'later', label: '나중' },
  { id: 'drop', label: '빼기' },
];

export function ColumnsStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  const count = (m: ColumnMode) => dept.columns.filter((c) => state.columnMode[c.id] === m).length;
  const left = dept.columns.filter((c) => !state.columnMode[c.id]).length;
  const todo = left > 0 ? `${left}개 열이 남았어요` : '오늘 2개 이상, 나중 1개 이상이 필요해요';

  return (
    <StepShell step="columns" lead="오늘 판단에 꼭 필요한 열만 남기세요." todo={todo}>
      <div className="counts">
        {MODES.map((m) => (
          <div key={m.id} className="count">
            <strong>{count(m.id)}</strong>
            {m.label}
          </div>
        ))}
      </div>
      <div className="sheet-wrap">
        {dept.columns.map((col) => (
          <div key={col.id} className="mode-row">
            <strong>{col.label}</strong>
            <div className="segmented" role="radiogroup" aria-label={col.label}>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={state.columnMode[col.id] === m.id}
                  className={state.columnMode[col.id] === m.id ? 'on' : ''}
                  onClick={() => update((s) => ({ ...s, columnMode: { ...s.columnMode, [col.id]: m.id } }))}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
