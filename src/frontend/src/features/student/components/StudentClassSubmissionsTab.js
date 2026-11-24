import { h, useState, useEffect } from '../../../lib/react.js';
import { Card, Badge, Spinner, Button } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { formatTime } from '../../../utils/formatTime.js';
import { fetchClassSubmissions } from '../api/studentApi.js';

export function StudentClassSubmissionsTab({ classId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetchClassSubmissions(classId);
      if (res?.items) setSubmissions(res.items);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) loadSubmissions();
  }, [classId]);

  return h(
    Card,
    {
      title: 'Lịch sử nộp bài của bạn',
      headerAction: h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: loadSubmissions,
          loading,
          style: { fontSize: '12px', padding: '4px 10px' },
        },
        'Làm mới',
      ),
    },
    h(
      'div',
      {
        style: {
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '12.5px',
          color: '#334155',
          marginBottom: '16px',
        },
      },
      'Hệ thống lưu trữ trạng thái thẩm định và điểm số của từng lần nộp bài. Mã nguồn không được lưu giữ trên hệ thống.',
    ),
    loading
      ? h(Spinner, { center: true, size: 24, label: 'Đang tải lịch sử bài nộp...' })
      : submissions.length === 0
        ? h(EmptyState, {
            title: 'Chưa có bài nộp nào trong lớp học này',
            description:
              'Hãy chọn một bài lab trong mục "Bài thực hành" để tiến hành nộp bài giải của bạn.',
          })
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
                  h('th', { style: { padding: '10px 12px' } }, 'Bài Lab'),
                  h('th', { style: { padding: '10px 12px' } }, 'Trạng thái'),
                  h('th', { style: { padding: '10px 12px' } }, 'Kết quả chấm'),
                  h('th', { style: { padding: '10px 12px' } }, 'Điểm số'),
                  h('th', { style: { padding: '10px 12px' } }, 'Thời gian nộp'),
                ),
              ),
              h(
                'tbody',
                null,
                submissions.map((sub) => {
                  const isJudged = sub.status === 'judged';
                  const isAC = sub.judgeVerdict === 'Accepted' || sub.judgeVerdict === 'AC';
                  return h(
                    'tr',
                    { key: sub.id, style: { borderBottom: '1px solid #f1f5f9' } },
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
                      { style: { padding: '10px 12px', fontWeight: '500', color: '#0f172a' } },
                      sub.labTitle || `Lab #${sub.labId}`,
                    ),
                    h(
                      'td',
                      { style: { padding: '10px 12px' } },
                      h(
                        Badge,
                        { variant: isJudged ? 'success' : 'warning', style: { fontWeight: '600' } },
                        sub.status.toUpperCase(),
                      ),
                    ),
                    h(
                      'td',
                      { style: { padding: '10px 12px' } },
                      isJudged
                        ? h(
                            Badge,
                            { variant: isAC ? 'success' : 'danger', style: { fontWeight: '600' } },
                            isAC ? 'Accepted' : sub.judgeVerdict || 'Failed',
                          )
                        : h(
                            'span',
                            { style: { color: '#d97706', fontSize: '12px', fontWeight: '500' } },
                            'Đang chấm...',
                          ),
                    ),
                    h(
                      'td',
                      { style: { padding: '10px 12px' } },
                      sub.publishedAt
                        ? h(
                            'span',
                            { style: { fontWeight: '700', color: '#059669', fontSize: '13px' } },
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
                            'Chờ GV công bố',
                          ),
                    ),
                    h(
                      'td',
                      { style: { padding: '10px 12px', color: '#64748b', fontSize: '12px' } },
                      formatTime(sub.createdAt),
                    ),
                  );
                }),
              ),
            ),
          ),
  );
}
