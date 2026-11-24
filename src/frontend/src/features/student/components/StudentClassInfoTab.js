import { h } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { formatTime } from '../../../utils/formatTime.js';

export function StudentClassInfoTab({ classroom, announcements = [] }) {
  const teachers = classroom?.teachers || [];
  const primaryTeacher = teachers[0] || null;
  const teacherName = primaryTeacher?.name || 'Chưa cập nhật';
  const teacherUsername = primaryTeacher?.username ? `@${primaryTeacher.username}` : '';
  const students = classroom?.students || [];
  const studentCount = classroom?.studentCount || students.length || 0;
  const labCount = classroom?.labCount || 0;

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
    // 1. Overview Cards: Teacher & Metrics
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        },
      },
      // Teacher Card
      h(
        'div',
        {
          style: {
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          },
        },
        h(
          'div',
          {
            style: {
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
              flexShrink: 0,
            },
          },
          teacherName.charAt(0).toUpperCase(),
        ),
        h(
          'div',
          { style: { overflow: 'hidden' } },
          h(
            'div',
            {
              style: {
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                fontWeight: '600',
              },
            },
            'Giảng viên phụ trách',
          ),
          h(
            'div',
            {
              style: {
                fontSize: '15px',
                fontWeight: '700',
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            },
            teacherName,
          ),
          h(
            'div',
            { style: { fontSize: '12px', color: '#1d4ed8', fontWeight: '500' } },
            teacherUsername,
          ),
        ),
      ),
      // Stats Card
      h(
        'div',
        {
          style: {
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          },
        },
        metricItem('Sĩ số lớp', `${studentCount} SV`, '#059669'),
        h('div', { style: { width: '1px', height: '36px', backgroundColor: '#e2e8f0' } }),
        metricItem('Bài thực hành', `${labCount} Labs`, '#2563eb'),
        h('div', { style: { width: '1px', height: '36px', backgroundColor: '#e2e8f0' } }),
        metricItem('Thông báo', `${announcements.length} Tin`, '#d97706'),
      ),
    ),
    // 2. Class Announcements Feed
    h(
      Card,
      { title: `📢 Bảng tin thông báo lớp học (${announcements.length})` },
      announcements.length === 0
        ? h(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '32px 16px',
                color: '#64748b',
                fontSize: '13.5px',
              },
            },
            h('div', { style: { fontSize: '28px', marginBottom: '8px' } }, '📭'),
            'Hiện tại chưa có thông báo mới nào từ Giảng viên.',
          )
        : h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
            announcements.map((a) =>
              h(
                'div',
                {
                  key: a.id,
                  style: {
                    padding: '14px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  },
                },
                h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    },
                  },
                  h(
                    'h4',
                    {
                      style: { margin: 0, fontWeight: '700', fontSize: '14.5px', color: '#0f172a' },
                    },
                    a.title,
                  ),
                  h(
                    'span',
                    { style: { fontSize: '11.5px', color: '#64748b', fontWeight: '500' } },
                    formatTime(a.createdAt),
                  ),
                ),
                h(
                  'p',
                  {
                    style: {
                      margin: 0,
                      fontSize: '13px',
                      color: '#334155',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    },
                  },
                  a.content,
                ),
              ),
            ),
          ),
    ),
    // 3. Guidelines & Rules Card
    h(
      Card,
      { title: '📌 Quy chế thực hành & Chấm điểm' },
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
            color: '#334155',
            lineHeight: '1.6',
          },
        },
        h(
          'div',
          null,
          '• ',
          h('strong', null, 'Ngôn ngữ: '),
          'Toàn bộ bài thực hành được biên dịch và chạy trên tiêu chuẩn C++20 trong Docker Sandbox cô lập.',
        ),
        h(
          'div',
          null,
          '• ',
          h('strong', null, 'Ràng buộc AST: '),
          'Hệ thống tự động kiểm tra cú pháp cấm hàm/thư viện bằng bộ phân tích AST Tree-sitter.',
        ),
        h(
          'div',
          null,
          '• ',
          h('strong', null, 'Công bố điểm: '),
          'Sau khi Giảng viên hoàn tất xét duyệt, điểm số chính thức và nhận xét sẽ được công bố tại tab "Các bài labs".',
        ),
      ),
    ),
  );
}

function metricItem(label, value, color) {
  return h(
    'div',
    { style: { textAlign: 'center' } },
    h('div', { style: { fontSize: '17px', fontWeight: '800', color: color || '#0f172a' } }, value),
    h(
      'div',
      { style: { fontSize: '11.5px', color: '#64748b', fontWeight: '500', marginTop: '2px' } },
      label,
    ),
  );
}
