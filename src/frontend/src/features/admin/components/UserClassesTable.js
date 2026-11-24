import { h } from '../../../lib/react.js';

export function UserClassesTable({ userClasses = [], defaultRoleLabel = 'Học viên' }) {
  if (userClasses.length === 0) {
    return h(
      'div',
      { style: { textAlign: 'center', padding: '36px 16px', color: '#64748b' } },
      h('div', { style: { fontSize: '32px', marginBottom: '8px' } }, '📚'),
      h(
        'p',
        { style: { margin: 0, fontWeight: '600', color: '#334155' } },
        'Chưa tham gia lớp học nào',
      ),
      h(
        'p',
        { style: { margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' } },
        'Người dùng này hiện chưa được gán hoặc ghi danh vào bất kỳ lớp học nào.',
      ),
    );
  }

  return h(
    'div',
    {
      style: {
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
      },
    },
    h(
      'table',
      { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
      h(
        'thead',
        null,
        h(
          'tr',
          {
            style: {
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              textAlign: 'left',
            },
          },
          h(
            'th',
            { style: { padding: '10px 12px', color: '#64748b', fontWeight: '600' } },
            'Mã lớp',
          ),
          h(
            'th',
            { style: { padding: '10px 12px', color: '#64748b', fontWeight: '600' } },
            'Tên lớp học',
          ),
          h(
            'th',
            { style: { padding: '10px 12px', color: '#64748b', fontWeight: '600' } },
            'Vai trò',
          ),
          h(
            'th',
            { style: { padding: '10px 12px', color: '#64748b', fontWeight: '600' } },
            'Thời gian',
          ),
          h(
            'th',
            { style: { padding: '10px 12px', color: '#64748b', fontWeight: '600' } },
            'Trạng thái',
          ),
        ),
      ),
      h(
        'tbody',
        null,
        userClasses.map((c) =>
          h(
            'tr',
            { key: c.id, style: { borderBottom: '1px solid #f1f5f9' } },
            h(
              'td',
              { style: { padding: '10px 12px', fontWeight: '600', color: '#64748b' } },
              `#${c.id}`,
            ),
            h(
              'td',
              { style: { padding: '10px 12px', fontWeight: '600', color: '#0f172a' } },
              c.name,
            ),
            h(
              'td',
              { style: { padding: '10px 12px' } },
              h(
                'span',
                {
                  style: {
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#1d4ed8',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                  },
                },
                c.role || defaultRoleLabel,
              ),
            ),
            h(
              'td',
              { style: { padding: '10px 12px', color: '#475569', fontSize: '12px' } },
              c.term || 'Học kỳ 1 / 2026',
            ),
            h(
              'td',
              { style: { padding: '10px 12px' } },
              h(
                'span',
                {
                  style: {
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#065f46',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                  },
                },
                c.status || 'Đang hoạt động',
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
