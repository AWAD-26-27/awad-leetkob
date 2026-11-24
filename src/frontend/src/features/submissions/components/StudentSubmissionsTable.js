import { h } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { SubmissionRow } from './SubmissionRow.js';

export function StudentSubmissionsTable({ submissions = [] }) {
  if (submissions.length === 0) {
    return h(
      Card,
      { title: 'Lịch sử bài nộp' },
      h(EmptyState, {
        title: 'Chưa có bài nộp nào',
        description:
          'Soạn thảo mã nguồn C++ ở cửa sổ bên trên và bấm "Nộp bài" để bắt đầu nộp bài.',
      }),
    );
  }

  return h(
    Card,
    { title: 'Lịch sử bài nộp' },
    h(
      'div',
      {
        style: {
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#334155',
          marginBottom: '14px',
        },
      },
      h('strong', null, 'Chính sách công bố điểm: '),
      'Chi tiết kết quả và điểm số chính thức sẽ hiển thị sau khi Giảng viên hoàn tất xét duyệt.',
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
                borderBottom: '1.5px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#475569',
                fontWeight: '600',
                fontSize: '12px',
              },
            },
            h('th', { style: { padding: '10px 12px' } }, 'Mã bài'),
            h('th', { style: { padding: '10px 12px' } }, 'Trạng thái'),
            h('th', { style: { padding: '10px 12px' } }, 'Kết quả chấm'),
            h('th', { style: { padding: '10px 12px' } }, 'Thời gian nộp'),
            h('th', { style: { padding: '10px 12px' } }, 'Đánh giá & Điểm số'),
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
