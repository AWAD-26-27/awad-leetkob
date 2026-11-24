import { h } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { SubmissionRow } from './SubmissionRow.js';

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
          submissions.map((sub) => h(SubmissionRow, { key: sub.id, sub })),
        ),
      ),
    ),
  );
}
