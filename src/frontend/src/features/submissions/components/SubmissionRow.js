import { h } from '../../../lib/react.js';
import { Badge } from '../../../components/ui/index.js';
import { formatTime } from '../../../utils/formatTime.js';
import { VERDICT_CONFIG } from '../../../config/constants.js';

export function SubmissionRow({ sub }) {
  const isJudged = sub.status === 'judged';
  const isAccepted = sub.judgeVerdict === 'Accepted' || sub.judgeVerdict === 'AC';
  const verdictVariant =
    VERDICT_CONFIG[sub.judgeVerdict]?.variant || (isAccepted ? 'success' : 'danger');

  return h(
    'tr',
    {
      key: sub.id,
      className: 'animate-fade-in',
      style: {
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color 0.15s ease',
      },
    },
    h(
      'td',
      {
        style: {
          padding: '12px 14px',
          fontFamily: 'var(--font-mono)',
          fontWeight: '700',
          color: '#2563eb',
        },
      },
      `#${sub.id}`,
    ),
    h(
      'td',
      { style: { padding: '12px 14px' } },
      h(
        Badge,
        {
          variant:
            sub.status === 'judged'
              ? 'success'
              : sub.status === 'judging'
                ? 'info'
                : 'warning',
          style: { fontWeight: '700' },
        },
        sub.status.toUpperCase(),
      ),
    ),
    h(
      'td',
      { style: { padding: '12px 14px' } },
      isJudged
        ? h(
            Badge,
            {
              variant: verdictVariant,
              style: { fontWeight: '700', padding: '4px 10px' },
            },
            isAccepted ? `✓ ${sub.judgeVerdict}` : sub.judgeVerdict || 'PENDING',
          )
        : h(
            'span',
            {
              style: {
                color: '#f59e0b',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              },
            },
            '⏳ Evaluating…',
          ),
    ),
    h(
      'td',
      {
        style: {
          padding: '12px 14px',
          color: 'var(--color-text-secondary)',
          fontSize: '12.5px',
          fontFamily: 'var(--font-mono)',
        },
      },
      formatTime(sub.createdAt || sub.created_at || Date.now()),
    ),
    h(
      'td',
      { style: { padding: '12px 14px' } },
      sub.publishedAt
        ? h(
            'span',
            { style: { color: 'var(--color-success)', fontWeight: '700' } },
            sub.grade !== undefined ? `${sub.grade} pts` : '✓ Released',
          )
        : h(
            'span',
            {
              style: {
                color: '#64748b',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
                background: '#f1f5f9',
                padding: '3px 8px',
                borderRadius: '6px',
                width: 'fit-content',
              },
            },
            '🔒 Hidden until TA publishes',
          ),
    ),
  );
}
