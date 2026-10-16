import { useId } from 'react';

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  chips?: string[];
  min?: number;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
}

/** 칩을 누르면 문장이 채워지고, 학습자는 그 문장을 고칠 수 있다. */
export function ChipInput({ label, value, onChange, chips = [], min = 0, placeholder, rows = 1, readOnly }: Props) {
  const id = useId();
  const length = value.trim().length;
  const ok = length >= min;
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {min > 0 && <span className={`field-hint${ok ? ' ok' : ''}`}>{ok ? '✓' : `${min}글자 이상`}</span>}
        </label>
      )}
      <textarea
        id={id}
        className="input"
        rows={rows}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        maxLength={200}
        onChange={(e) => onChange(e.target.value)}
      />
      {chips.length > 0 && !readOnly && (
        <div className="chips">
          {chips.map((chip) => (
            <button key={chip} type="button" className="chip" onClick={() => onChange(chip)}>
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
