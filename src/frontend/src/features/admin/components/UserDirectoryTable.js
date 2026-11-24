import { h } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';

export function UserDirectoryTable({ users, classes }) {
  return h(
    Card,
    null,
    h(
      'div',
      {
        style: {
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      h(
        'h3',
        {
          style: {
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#0f172a',
          },
        },
        '📋 Danh Bạ Người Dùng Hệ Thống (User Directory)',
      ),
    ),
    h(
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
            h('th', { style: { padding: '10px 14px', color: '#64748b' } }, 'ID'),
            h('th', { style: { padding: '10px 14px', color: '#64748b' } }, 'Họ và Tên'),
            h('th', { style: { padding: '10px 14px', color: '#64748b' } }, 'Username'),
            h('th', { style: { padding: '10px 14px', color: '#64748b' } }, 'Vai trò'),
            h('th', { style: { padding: '10px 14px', color: '#64748b' } }, 'Lớp phụ trách / Học tập'),
            h('th', { style: { padding: '10px 14px', color: '#64748b' } }, 'Bearer Token'),
          ),
        ),
        h(
          'tbody',
          null,
          users.map((u) => {
            const roleBadgeColor =
              u.role === 'admin' ? '#8b5cf6' : u.role === 'ta' ? '#3b82f6' : '#10b981';
            const roleBadgeBg =
              u.role === 'admin' ? '#f5f3ff' : u.role === 'ta' ? '#eff6ff' : '#ecfdf5';
            const userClass = classes.find((c) => c.id === u.classId);

            return h(
              'tr',
              { key: u.id, style: { borderBottom: '1px solid #f1f5f9' } },
              h('td', { style: { padding: '10px 14px', fontWeight: '600' } }, `#${u.id}`),
              h('td', { style: { padding: '10px 14px', fontWeight: '600', color: '#0f172a' } }, u.name),
              h('td', { style: { padding: '10px 14px', fontFamily: 'monospace', color: '#475569' } }, `@${u.username}`),
              h(
                'td',
                { style: { padding: '10px 14px' } },
                h(
                  'span',
                  {
                    style: {
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: roleBadgeColor,
                      backgroundColor: roleBadgeBg,
                      border: `1px solid ${roleBadgeColor}33`,
                    },
                  },
                  u.role.toUpperCase(),
                ),
              ),
              h(
                'td',
                { style: { padding: '10px 14px', color: '#334155' } },
                userClass
                  ? `${userClass.name} (ID: ${userClass.id})`
                  : u.role === 'admin'
                    ? 'Toàn hệ thống'
                    : '— Chưa gán lớp —',
              ),
              h(
                'td',
                { style: { padding: '10px 14px', fontFamily: 'monospace', fontSize: '11px', color: '#64748b' } },
                u.token || 'N/A',
              ),
            );
          }),
        ),
      ),
    ),
  );
}
