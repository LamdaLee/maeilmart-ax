import { SLOTS } from '../content/steps';
import type { SlotId, Slots } from '../types';

interface Props {
  values: Slots<string>;
  onChange?: (slot: SlotId, value: string) => void;
  chips?: Slots<string[]>;
  pain?: SlotId | null;
  className?: string;
}

/** As-is와 To-Be가 같이 쓰는 다섯 칸. onChange가 없으면 읽기 전용. */
export function SlotGrid({ values, onChange, chips, pain, className = '' }: Props) {
  return (
    <div className={`flow ${className}`}>
      {SLOTS.map((slot, i) => (
        <div key={slot.id} className={`slot${pain === slot.id ? ' pain' : ''}`}>
          <div className="slot-name">
            <span className="slot-num">{i + 1}</span>
            {slot.label}
            {pain === slot.id && <span className="pain-tag">Pain point</span>}
          </div>
          {onChange ? (
            <div className="slot-body">
              <textarea
                rows={1}
                className="input"
                aria-label={slot.label}
                value={values[slot.id]}
                maxLength={120}
                onChange={(e) => onChange(slot.id, e.target.value)}
              />
              {chips && (
                <div className="chips">
                  {chips[slot.id].map((chip) => (
                    <button key={chip} type="button" className="chip" onClick={() => onChange(slot.id, chip)}>
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="slot-text">{values[slot.id] || '—'}</div>
          )}
        </div>
      ))}
    </div>
  );
}
