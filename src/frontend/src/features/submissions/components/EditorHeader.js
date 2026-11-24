import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function EditorHeader({ onCopy, copied, onReset, onSubmit, submitting }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#090d16',
        borderBottom: '1px solid #1e293b',
      },
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h(
        'span',
        {
          style: {
            fontFamily: 'monospace',
            fontSize: '12.5px',
            color: '#f8fafc',
            fontWeight: '600',
          },
        },
        'main.cpp',
      ),
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            color: '#94a3b8',
            backgroundColor: '#1e293b',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '500',
          },
        },
        'C++20 (GCC 14)',
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h(
        'button',
        {
          type: 'button',
          onClick: onReset,
          style: {
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '4px 10px',
            color: '#94a3b8',
            fontSize: '12px',
            cursor: 'pointer',
          },
        },
        'Đặt lại mã',
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: onCopy,
          style: {
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '4px 10px',
            color: copied ? '#10b981' : '#cbd5e1',
            fontSize: '12px',
            cursor: 'pointer',
          },
        },
        copied ? 'Đã chép' : 'Sao chép',
      ),
      h(
        Button,
        {
          variant: 'primary',
          size: 'sm',
          onClick: onSubmit,
          loading: submitting,
          style: {
            padding: '5px 16px',
            fontSize: '13px',
            fontWeight: '600',
          },
        },
        'Nộp bài',
      ),
    ),
  );
}
