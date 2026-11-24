import { h } from '../../../lib/react.js';
import { Card, Badge, Spinner } from '../../../components/ui/index.js';

export function LabClassGradesTable({ students = [], loading = false }) {
  const getStatusBadge = (status) => {
    if (status === 'Accepted') return { variant: 'success', text: 'Accepted (AC)' };
    if (status === 'WA') return { variant: 'danger', text: 'Wrong Answer (WA)' };
    if (status === 'TLE') return { variant: 'danger', text: 'Time Limit (TLE)' };
    if (status === 'CE') return { variant: 'danger', text: 'Compile Error (CE)' };
    if (status === 'queued') return { variant: 'warning', text: 'Đang chờ chấm' };
    if (status === 'judging') return { variant: 'info', text: 'Đang chấm' };
    return { variant: 'neutral', text: 'Chưa nộp bài' };
  };

  const getReviewBadge = (reviewStatus, deductions = []) => {
    if (reviewStatus === 'pending')
      return { color: '#d97706', bg: '#fffbeb', text: '⏳ Chờ xét duyệt' };
    if (reviewStatus === 'confirmed')
      return { color: '#dc2626', bg: '#fef2f2', text: '⚠️ Đã trừ điểm' };
    if (deductions.length > 0) return { color: '#dc2626', bg: '#fef2f2', text: '⚠️ Có vi phạm' };
    return { color: '#059669', bg: '#ecfdf5', text: '✓ Hợp lệ' };
  };

  return h(
    Card,
    { style: { padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        },
      },
      h(
        'div',
        null,
        h(
          'h3',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          'Bảng Điểm & Danh Sách Nộp Bài Của Lớp',
        ),
        h(
          'div',
          { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
          'Theo dõi toàn bộ sinh viên, số lần nộp bài, kết quả chấm điểm và khấu trừ vi phạm.',
        ),
      ),
      h(
        'span',
        { style: { fontSize: '13px', fontWeight: '600', color: '#334155' } },
        `Tổng số: ${students.length} sinh viên`,
      ),
    ),

    loading
      ? h(Spinner, { center: true, size: 32, label: 'Đang tải bảng điểm lớp học...' })
      : students.length === 0
        ? h(
            'div',
            { style: { padding: '32px', textAlign: 'center', color: '#64748b' } },
            'Lớp học chưa có sinh viên nào.',
          )
        : h(
            'div',
            { style: { overflowX: 'auto' } },
            h(
              'table',
              {
                style: {
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '13.5px',
                },
              },
              h(
                'thead',
                null,
                h(
                  'tr',
                  {
                    style: {
                      borderBottom: '2px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: '600',
                    },
                  },
                  h('th', { style: { padding: '12px 10px', width: '45px' } }, 'STT'),
                  h('th', { style: { padding: '12px 10px' } }, 'Sinh viên'),
                  h(
                    'th',
                    { style: { padding: '12px 10px', textAlign: 'center' } },
                    'Số lần submit',
                  ),
                  h('th', { style: { padding: '12px 10px' } }, 'Trạng thái'),
                  h('th', { style: { padding: '12px 10px', textAlign: 'center' } }, 'Điểm số'),
                  h('th', { style: { padding: '12px 10px' } }, 'Khấu trừ vi phạm'),
                  h('th', { style: { padding: '12px 10px', textAlign: 'center' } }, 'Xét duyệt'),
                ),
              ),
              h(
                'tbody',
                null,
                students.map((stu, idx) => {
                  const statusInfo = getStatusBadge(stu.latestStatus);
                  const revInfo = getReviewBadge(stu.reviewStatus, stu.deductions);
                  return h(
                    'tr',
                    { key: stu.id, style: { borderBottom: '1px solid #f1f5f9' } },
                    h('td', { style: { padding: '12px 10px', color: '#64748b' } }, idx + 1),
                    h(
                      'td',
                      { style: { padding: '12px 10px' } },
                      h(
                        'div',
                        { style: { fontWeight: '600', color: '#0f172a' } },
                        stu.name || stu.username,
                      ),
                      h(
                        'div',
                        { style: { fontSize: '12px', color: '#64748b', fontFamily: 'monospace' } },
                        `@${stu.username}`,
                      ),
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 10px', textAlign: 'center' } },
                      h(
                        'span',
                        {
                          style: {
                            fontWeight: '700',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            background: stu.submissionCount > 0 ? '#eff6ff' : '#f1f5f9',
                            color: stu.submissionCount > 0 ? '#1d4ed8' : '#64748b',
                            fontSize: '12.5px',
                          },
                        },
                        `${stu.submissionCount} lần`,
                      ),
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 10px' } },
                      h(Badge, { variant: statusInfo.variant }, statusInfo.text),
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 10px', textAlign: 'center' } },
                      stu.score !== null
                        ? h(
                            'span',
                            {
                              style: {
                                fontSize: '15px',
                                fontWeight: '800',
                                color:
                                  stu.score >= 8
                                    ? '#059669'
                                    : stu.score >= 5
                                      ? '#d97706'
                                      : '#dc2626',
                              },
                            },
                            `${stu.score} / 10`,
                          )
                        : h('span', { style: { color: '#94a3b8' } }, '—'),
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 10px' } },
                      stu.deductions && stu.deductions.length > 0
                        ? stu.deductions.map((d, i) =>
                            h(
                              'div',
                              { key: i, style: { fontSize: '12px', color: '#b91c1c' } },
                              `-${d.deduction}đ (${d.code})`,
                            ),
                          )
                        : h(
                            'span',
                            { style: { color: '#059669', fontSize: '12.5px' } },
                            'Không vi phạm',
                          ),
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 10px', textAlign: 'center' } },
                      h(
                        'span',
                        {
                          style: {
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            color: revInfo.color,
                            background: revInfo.bg,
                          },
                        },
                        revInfo.text,
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
  );
}
