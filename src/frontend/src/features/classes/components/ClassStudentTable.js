import { h } from '../../../lib/react.js';

export function ClassStudentTable({ classStudents = [], onRemove }) {
  if (!classStudents || classStudents.length === 0) {
    return h(
      'div',
      {
        style: {
          padding: '24px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '13px',
          backgroundColor: '#fbfcfd',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        },
      },
      h('span', { style: { fontSize: '24px' } }, '📭'),
      h('div', { style: { fontWeight: '600', color: '#475569' } }, 'Chưa có sinh viên nào trong lớp này'),
      h('div', { style: { fontSize: '12px', color: '#94a3b8' } }, 'Sử dụng form trên để thêm sinh viên vào danh sách lớp.'),
    );
  }

  return h(
    'div',
    { style: { overflowX: 'auto' } },
    h(
      'table',
      { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' } },
      h(
        'thead',
        null,
        h(
          'tr',
          { style: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' } },
          h('th', { style: { padding: '10px 14px', color: '#64748b', fontSize: '12.5px', width: '70px' } }, 'ID'),
          h('th', { style: { padding: '10px 14px', color: '#64748b', fontSize: '12.5px' } }, 'Họ và Tên'),
          h('th', { style: { padding: '10px 14px', color: '#64748b', fontSize: '12.5px' } }, 'Username'),
          h('th', { style: { padding: '10px 14px', color: '#64748b', fontSize: '12.5px', textAlign: 'right' } }, 'Thao tác'),
        ),
      ),
      h(
        'tbody',
        null,
        classStudents.map((stu) =>
          h(
            'tr',
            {
              key: stu.id,
              style: {
                borderBottom: '1px solid #f1f5f9',
                transition: 'background-color 0.1s ease',
              },
            },
            h(
              'td',
              { style: { padding: '11px 14px', fontWeight: '600', color: '#64748b', fontFamily: 'monospace' } },
              `#${stu.id}`,
            ),
            h(
              'td',
              { style: { padding: '11px 14px' } },
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                h(
                  'div',
                  {
                    style: {
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      flexShrink: 0,
                    },
                  },
                  stu.name ? stu.name.charAt(0).toUpperCase() : 'S',
                ),
                h('span', { style: { fontWeight: '600', color: '#0f172a' } }, stu.name || 'Sinh viên'),
              ),
            ),
            h(
              'td',
              { style: { padding: '11px 14px', fontFamily: 'monospace', color: '#475569', fontSize: '13px' } },
              `@${stu.username}`,
            ),
            h(
              'td',
              { style: { padding: '11px 14px', textAlign: 'right' } },
              onRemove &&
                h(
                  'button',
                  {
                    type: 'button',
                    onClick: () => onRemove(stu.id, stu.name || stu.username),
                    style: {
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#dc2626',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    },
                  },
                  '✕ Xóa khỏi lớp',
                ),
            ),
          ),
        ),
      ),
    ),
  );
}
