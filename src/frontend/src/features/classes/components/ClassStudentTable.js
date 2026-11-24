import { h } from '../../../lib/react.js';

export function ClassStudentTable({ classStudents, onRemove }) {
  if (classStudents.length === 0) {
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
        },
      },
      'Chưa có sinh viên nào trong lớp này. Hãy sử dụng form trên để thêm sinh viên.',
    );
  }

  return h(
    'div',
    { style: { overflowX: 'auto' } },
    h(
      'table',
      { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
      h(
        'thead',
        null,
        h(
          'tr',
          { style: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' } },
          h('th', { style: { padding: '8px 12px', color: '#64748b' } }, 'ID'),
          h('th', { style: { padding: '8px 12px', color: '#64748b' } }, 'Họ và Tên'),
          h('th', { style: { padding: '8px 12px', color: '#64748b' } }, 'Tên đăng nhập (Username)'),
          h('th', { style: { padding: '8px 12px', color: '#64748b', textAlign: 'right' } }, 'Thao tác'),
        ),
      ),
      h(
        'tbody',
        null,
        classStudents.map((stu) =>
          h(
            'tr',
            { key: stu.id, style: { borderBottom: '1px solid #f1f5f9' } },
            h('td', { style: { padding: '10px 12px', fontWeight: '600' } }, `#${stu.id}`),
            h('td', { style: { padding: '10px 12px', fontWeight: '600', color: '#0f172a' } }, stu.name),
            h('td', { style: { padding: '10px 12px', fontFamily: 'monospace', color: '#475569' } }, `@${stu.username}`),
            h(
              'td',
              { style: { padding: '10px 12px', textAlign: 'right' } },
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => onRemove(stu.id, stu.name),
                  style: {
                    padding: '4px 10px',
                    fontSize: '11px',
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
