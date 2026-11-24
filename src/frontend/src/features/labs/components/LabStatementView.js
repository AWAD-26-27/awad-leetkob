import { h } from '../../../lib/react.js';

export function LabStatementView({ lab }) {
  return h(
    'div',
    { className: 'animate-fade-in', style: { marginBottom: '16px' } },
    h(
      'div',
      {
        style: {
          padding: '16px 20px',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          color: '#1e293b',
        },
      },
      lab.statement || lab.statementMd || lab.statement_md || 'Không có mô tả chi tiết.',
    ),
  );
}
