import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function EditorHeader({ onCopy, copied, onLoadTemplate, onSubmit, submitting }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: '#070a10',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      },
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
      h('span', {
        style: {
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#ff5f56',
          display: 'inline-block',
          boxShadow: '0 0 6px rgba(255, 95, 86, 0.4)',
        },
      }),
      h('span', {
        style: {
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#ffbd2e',
          display: 'inline-block',
          boxShadow: '0 0 6px rgba(255, 189, 46, 0.4)',
        },
      }),
      h('span', {
        style: {
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#27c93f',
          display: 'inline-block',
          boxShadow: '0 0 6px rgba(39, 201, 63, 0.4)',
        },
      }),
      h(
        'span',
        {
          style: {
            marginLeft: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#f8fafc',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          },
        },
        '⚡ solution.cpp',
        h(
          'span',
          {
            style: {
              fontSize: '10px',
              color: '#94a3b8',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '500',
            },
          },
          'C++20 (GCC 14)',
        ),
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
      h(
        'button',
        {
          type: 'button',
          onClick: onCopy,
          style: {
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '4px 10px',
            color: copied ? '#10b981' : '#cbd5e1',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          },
        },
        copied ? '✓ Copied' : '📋 Copy',
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: () => onLoadTemplate('dynamicArray'),
          style: {
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            color: '#93c5fd',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          },
        },
        '💡 Load Safe Array Template',
      ),
      h(
        Button,
        {
          variant: 'primary',
          size: 'sm',
          onClick: onSubmit,
          loading: submitting,
          style: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: '6px 18px',
            fontSize: '12.5px',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          },
        },
        'Nộp bài giải (Submit)',
      ),
    ),
  );
}
