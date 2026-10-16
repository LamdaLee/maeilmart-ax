import type { RunRow } from '../engine/runWorkflow';
import type { CourseState, Department, Route } from '../types';

export const ROUTE_LABEL: Record<Route, string> = { auto: '자동', human: '사람', data: '예전 사례' };

interface Props {
  dept: Department;
  caseEdit?: CourseState['caseEdit'];
  rows?: RunRow[];
}

/** 스프레드시트처럼 보이는 10행 표. rows가 있으면 실행 결과 열이 붙는다. */
export function CaseSheet({ dept, caseEdit = null, rows }: Props) {
  const columns = dept.columns.filter((c) => c.inTable);
  return (
    <div className="sheet-wrap">
      <table className="sheet">
        <thead>
          <tr>
            <th className="rownum" />
            {columns.map((col) => (
              <th key={col.id}>{col.label}</th>
            ))}
            {rows && <th>결과</th>}
            {rows && <th>지나간 길</th>}
          </tr>
        </thead>
        <tbody>
          {dept.cases.map((c, i) => {
            const row = rows?.find((r) => r.caseId === c.id);
            const sentence = caseEdit?.id === c.id && !c.trap ? caseEdit.text : c.sentence;
            return (
              <tr key={c.id} className={row ? (row.ok ? 'row-ok' : 'row-bad') : ''}>
                <td className="rownum">{i + 1}</td>
                {columns.map((col) => (
                  <td key={col.id} className={col.id === 'sentence' ? 'wrap' : ''}>
                    {col.id === 'sentence' ? sentence : c.cells[col.id]}
                  </td>
                ))}
                {row && (
                  <td className="result">
                    <span className={`route ${row.route}`}>{ROUTE_LABEL[row.route]}</span>
                    <div>{row.text}</div>
                    {!row.ok && <strong style={{ color: 'var(--bad)' }}>✕ 기대: {ROUTE_LABEL[row.expects]}</strong>}
                  </td>
                )}
                {row && (
                  <td className="wrap">
                    <div className="trace">
                      {row.trace.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
