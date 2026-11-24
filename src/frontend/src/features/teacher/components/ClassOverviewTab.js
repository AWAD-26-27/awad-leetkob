import { h } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';

export function ClassOverviewTab({ classroom, labs = [], students = [], announcements = [] }) {
  const teacherText =
    classroom?.teachers && classroom.teachers.length > 0
      ? classroom.teachers.map((t) => `${t.name} (@${t.username})`).join(', ')
      : 'Chưa phân công';

  const stats = [
    { label: 'Sĩ số sinh viên', val: students.length, icon: '👥', color: '#2563eb', bg: '#eff6ff' },
    {
      label: 'Bài thực hành (Labs)',
      val: labs.length,
      icon: '🧪',
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      label: 'Thông báo lớp học',
      val: announcements.length,
      icon: '📢',
      color: '#d97706',
      bg: '#fffbeb',
    },
  ];

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    // Stats Summary Grid
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        },
      },
      stats.map((s, idx) =>
        h(
          Card,
          {
            key: idx,
            style: {
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
            },
          },
          h(
            'div',
            {
              style: {
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: s.bg,
                color: s.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              },
            },
            s.icon,
          ),
          h(
            'div',
            null,
            h('div', { style: { fontSize: '13px', color: '#64748b', fontWeight: '500' } }, s.label),
            h(
              'div',
              {
                style: { fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '2px' },
              },
              s.val,
            ),
          ),
        ),
      ),
    ),

    // Detailed Information Card
    h(
      Card,
      { style: { padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' } },
        h('span', { style: { fontSize: '18px' } }, '📌'),
        h(
          'h3',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          'Thông Tin Lớp Học',
        ),
      ),
      h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          },
        },
        h(
          'div',
          {
            style: {
              background: '#f8fafc',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
            },
          },
          h(
            'div',
            { style: { fontSize: '12px', color: '#64748b', fontWeight: '600' } },
            'TÊN LỚP HỌC',
          ),
          h(
            'div',
            { style: { fontSize: '15px', color: '#0f172a', fontWeight: '700', marginTop: '4px' } },
            classroom?.name || '---',
          ),
        ),
        h(
          'div',
          {
            style: {
              background: '#f8fafc',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
            },
          },
          h(
            'div',
            { style: { fontSize: '12px', color: '#64748b', fontWeight: '600' } },
            'MÃ LỚP (ID)',
          ),
          h(
            'div',
            { style: { fontSize: '15px', color: '#0f172a', fontWeight: '700', marginTop: '4px' } },
            `#${classroom?.id || '---'}`,
          ),
        ),
        h(
          'div',
          {
            style: {
              background: '#f8fafc',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
            },
          },
          h(
            'div',
            { style: { fontSize: '12px', color: '#64748b', fontWeight: '600' } },
            'GIẢNG VIÊN PHỤ TRÁCH',
          ),
          h(
            'div',
            { style: { fontSize: '15px', color: '#2563eb', fontWeight: '700', marginTop: '4px' } },
            teacherText,
          ),
        ),
      ),
      h(
        'div',
        {
          style: {
            marginTop: '20px',
            padding: '14px 18px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            fontSize: '13.5px',
            color: '#1e40af',
            lineHeight: '1.5',
          },
        },
        '💡 ',
        h('strong', null, 'Lưu ý dành cho Giảng viên: '),
        'Giảng viên có toàn quyền đăng thông báo, tạo bài thực hành (Labs), theo dõi tiến độ nộp bài và xét duyệt vi phạm AST. Việc thêm/xóa sinh viên khỏi lớp được thực hiện tập trung bởi Quản trị viên (Admin).',
      ),
    ),
  );
}
