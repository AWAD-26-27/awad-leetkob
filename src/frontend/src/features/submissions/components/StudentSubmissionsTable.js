import { h } from '../../../lib/react.js';
import { Card, Badge } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { formatTime } from '../../../utils/formatTime.js';

/**
 * Strictly enforces Student FAQ Privacy Invariant:
 * Prior to publishing, only { id, status, judgeVerdict } are displayed.
 * Constraint verdicts, deductions, and LLM evidence snippets are NEVER shown.
 */
export function StudentSubmissionsTable({ submissions = [] }) {
  if (submissions.length === 0) {
    return h(
      Card,
      { title: 'Lịch Sử Bài Nộp (Your Submissions)' },
      h(EmptyState, {
        title: 'Chưa có bài nộp nào',
        description:
          'Nhập code C++ vào cửa sổ soạn thảo bên trên và bấm "Nộp bài giải" để bắt đầu chấm tự động.',
      }),
    );
  }

  return h(
    Card,
    { title: 'Lịch Sử Bài Nộp (Your Submissions)' },
    // Privacy FAQ banner callout
    h(
      'div',
      {
        style: {
          padding: '10px 14px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
        },
      },
      h('span', { style: { fontSize: '15px' } }, '🔒'),
      h(
        'span',
        null,
        h('strong', null, 'Chính sách bảo mật (FAQ): '),
        'Bằng chứng vi phạm AST và chi tiết điểm trừ được giữ bí mật cho đến khi Trợ giảng chính thức công bố điểm.',
      ),
    ),

    h(
      'div',
      { style: { overflowX: 'auto' } },
      h(
        'table',
        {
          style: {
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
          },
        },
        h(
          'thead',
          null,
          h(
            'tr',
            {
              style: {
                borderBottom: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
                fontWeight: '700',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              },
            },
            h('th', { style: { padding: '12px 14px' } }, 'Mã bài (#ID)'),
            h('th', { style: { padding: '12px 14px' } }, 'Trạng thái'),
            h('th', { style: { padding: '12px 14px' } }, 'Kết quả Judge'),
            h('th', { style: { padding: '12px 14px' } }, 'Thời gian nộp'),
            h('th', { style: { padding: '12px 14px' } }, 'Đánh giá Ràng buộc'),
          ),
        ),
        h(
          'tbody',
          null,
          submissions.map((sub) => {
            const isJudged = sub.status === 'judged';
            const isAccepted = sub.judgeVerdict === 'Accepted' || sub.judgeVerdict === 'AC';
            const verdictVariant = isAccepted ? 'success' : 'danger';

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
                // FAQ Invariant: When not published, explicit lock badge
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
          }),
        ),
      ),
    ),
  );
}
