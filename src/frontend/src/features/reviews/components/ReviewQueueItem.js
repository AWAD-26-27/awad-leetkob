import { h } from '../../../lib/react.js';
import { Badge, Button } from '../../../components/ui/index.js';

export function ReviewQueueItem({ item, processingId, onAction }) {
  const studentName = item.student || `Student ${item.studentId || ''}`;
  const hasReviewed = Boolean(
    item.decision || item.reviewStatus === 'confirmed' || item.reviewStatus === 'overturned',
  );
  const confirmBtnName = `Confirm ${studentName}`;
  const isConfirming =
    processingId === `${item.id}-${item.constraintCode || 'legacy'}-confirm`;
  const isOverturning =
    processingId === `${item.id}-${item.constraintCode || 'legacy'}-overturn`;

  return h(
    'li',
    {
      key: `${item.id}-${item.constraintCode || item.verdict}`,
      className: 'animate-fade-in',
      style: {
        padding: '16px 18px',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h(
          'span',
          { style: { fontWeight: '800', fontSize: '16px', letterSpacing: '-0.01em' } },
          `${studentName}: ${item.verdict || 'PENDING'}`,
        ),
        item.constraintCode && h(Badge, { variant: 'info' }, `Rule ${item.constraintCode}`),
        item.deduction > 0 && h(Badge, { variant: 'danger' }, `-${item.deduction} pts`),
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        hasReviewed
          ? h(
              Badge,
              {
                variant:
                  item.decision === 'confirm' || item.reviewStatus === 'confirmed'
                    ? 'success'
                    : 'warning',
                style: { fontWeight: '700', padding: '5px 12px' },
              },
              `Decision: ${(item.decision || item.reviewStatus || '').toUpperCase()}`,
            )
          : h(
              Badge,
              { variant: 'warning', style: { fontWeight: '700', padding: '5px 12px' } },
              '⏳ Pending Review',
            ),
      ),
    ),
    item.evidence &&
      h(
        'div',
        {
          style: {
            padding: '12px 16px',
            backgroundColor: '#0b0f19',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderLeft: '4px solid #ef4444',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: '#e2e8f0',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)',
          },
        },
        h(
          'div',
          {
            style: {
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          },
          h('span', null, '📍 Bằng chứng vi phạm phát hiện (AST / LLM Evidence):'),
          h(
            'span',
            {
              style: {
                fontSize: '10px',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 6px',
                borderRadius: '4px',
              },
            },
            'Confidence: High',
          ),
        ),
        h(
          'div',
          { style: { whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#fca5a5' } },
          typeof item.evidence === 'string'
            ? item.evidence
            : JSON.stringify(item.evidence, null, 2),
        ),
      ),
    !hasReviewed &&
      h(
        'div',
        { style: { display: 'flex', gap: '10px', marginTop: '6px' } },
        h(
          Button,
          {
            variant: 'primary',
            size: 'sm',
            onClick: () => onAction(item, 'confirm'),
            loading: isConfirming,
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              fontWeight: '700',
              padding: '6px 18px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
            },
          },
          `✓ ${confirmBtnName}`,
        ),
        h(
          Button,
          {
            variant: 'danger',
            size: 'sm',
            onClick: () => onAction(item, 'overturn'),
            loading: isOverturning,
            style: {
              fontWeight: '600',
              padding: '6px 16px',
            },
          },
          'Overturn (False Positive)',
        ),
      ),
  );
}
