import { useState } from 'react';
import { StepShell } from '../components/StepShell';
import { useDept, useProgress } from '../state/ProgressContext';

export function CasesStep() {
  const { state, update } = useProgress();
  const dept = useDept();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const fieldLabel = (id: string) => dept.fields.find((f) => f.id === id)?.label ?? id;

  return (
    <StepShell
      step="cases"
      lead="오늘 들어온 10건이에요. 한 건을 골라 첫 문장을 다르게 고쳐 보세요."
      todo="한 건의 문장을 고쳐 저장하세요"
    >
      <div className="notice info">문장만 바뀌어요. 판단에 쓰는 값(아래 회색 글씨)은 그대로입니다.</div>
      <div className="sheet-wrap">
        {dept.cases.map((c, i) => {
          const edited = state.caseEdit?.id === c.id ? state.caseEdit.text : null;
          const isEditing = editing === c.id;
          return (
            <div key={c.id} className="inbox-item">
              <span className="inbox-id">{i + 1}번</span>
              <div>
                {isEditing ? (
                  <textarea
                    className="input"
                    value={draft}
                    autoFocus
                    maxLength={120}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                ) : (
                  <div className={`inbox-text${edited ? ' edited' : ''}`}>{edited ?? c.sentence}</div>
                )}
                <div className="inbox-facts">
                  {Object.entries(c.facts).map(([k, v]) => (
                    <span key={k}>
                      {fieldLabel(k)}: {v}
                    </span>
                  ))}
                </div>
              </div>
              {c.trap ? (
                <span className="lock">🔒 잠김</span>
              ) : isEditing ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-small btn-primary"
                    disabled={!draft.trim() || draft.trim() === c.sentence}
                    onClick={() => {
                      update((s) => ({ ...s, caseEdit: { id: c.id, text: draft.trim() } }));
                      setEditing(null);
                    }}
                  >
                    저장
                  </button>
                  <button className="btn btn-small" onClick={() => setEditing(null)}>
                    취소
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-small"
                  onClick={() => {
                    setEditing(c.id);
                    setDraft(edited ?? c.sentence);
                  }}
                >
                  문장 고치기
                </button>
              )}
            </div>
          );
        })}
      </div>
    </StepShell>
  );
}
