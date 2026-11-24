import { h } from '../../../lib/react.js';
import { Spinner } from '../../../components/ui/index.js';

export function AdminDirectoryTab({ usersList, loadingUsers }) {
  if (loadingUsers) {
    return h(
      'div',
      { style: { textAlign: 'center', padding: '24px' } },
      h(Spinner, { center: true, size: 24, label: 'Đang tải danh sách người dùng...' }),
    );
  }

  return h(
    'div',
    { style: { maxHeight: '280px', overflowY: 'auto' } },
    h(
      'table',
      { style: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' } },
      h(
        'thead',
        null,
        h(
          'tr',
          { style: { borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' } },
          h('th', { style: { padding: '8px' } }, 'ID'),
          h('th', { style: { padding: '8px' } }, 'Username'),
          h('th', { style: { padding: '8px' } }, 'Role'),
          h('th', { style: { padding: '8px' } }, 'Class'),
        ),
      ),
      h(
        'tbody',
        null,
        usersList.map((u) =>
          h(
            'tr',
            { key: u.id, style: { borderBottom: '1px solid #f1f5f9' } },
            h('td', { style: { padding: '8px' } }, u.id),
            h('td', { style: { padding: '8px', fontWeight: '600' } }, u.username),
            h('td', { style: { padding: '8px' } }, u.role.toUpperCase()),
            h('td', { style: { padding: '8px' } }, u.classId ? `Class ${u.classId}` : 'All'),
          ),
        ),
      ),
    ),
  );
}
