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
      style: {
        borderBottom: '1px solid #f1f5f9',
      },
    },
    h(
      'td',
      {
        style: {
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontWeight: '600',
          color: '#2563eb',
        },
      },
      `#${sub.id}`,
    ),
    h(
      'td',
      { style: { padding: '10px 12px' } },
      h(
        Badge,
        {
          variant:
            sub.status === 'judged' ? 'success' : sub.status === 'judging' ? 'info' : 'warning',
          style: { fontWeight: '600' },
        },
        sub.status.toUpperCase(),
      ),
    ),
    h(
      'td',
      { style: { padding: '10px 12px' } },
      isJudged
        ? h(
            Badge,
            {
              variant: verdictVariant,
              style: { fontWeight: '600', padding: '3px 8px' },
            },
            isAccepted ? sub.judgeVerdict : sub.judgeVerdict || 'PENDING',
          )
        : h(
            'span',
            {
              style: {
                color: '#d97706',
                fontWeight: '500',
                fontSize: '12px',
              },
            },
            'Đang chấm...',
          ),
    ),
    h(
      'td',
      {
        style: {
          padding: '10px 12px',
          color: '#64748b',
          fontSize: '12px',
        },
      },
      formatTime(sub.createdAt || sub.created_at || Date.now()),
    ),
    h(
      'td',
      { style: { padding: '10px 12px' } },
      sub.publishedAt
        ? h(
            'span',
            { style: { color: '#059669', fontWeight: '600', fontSize: '13px' } },
            sub.grade !== undefined ? `${sub.grade} điểm` : 'Đã công bố',
          )
        : h(
            'span',
            {
              style: {
                color: '#64748b',
                fontSize: '11.5px',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '4px',
              },
            },
            'Chờ công bố (Hidden until TA publishes)',
          ),
    ),
  );
}
