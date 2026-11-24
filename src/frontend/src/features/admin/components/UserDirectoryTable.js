import { h, useState } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { UserDirectoryFilterBar } from './UserDirectoryFilterBar.js';
import { UserTableRow } from './UserTableRow.js';
import { UserClassesModal } from './UserClassesModal.js';

export function UserDirectoryTable({ users = [], classes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id-asc');
  const [selectedUserForClasses, setSelectedUserForClasses] = useState(null);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchTerm.trim() ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const hasClass =
      (u.classId !== null && u.classId !== undefined) ||
      (Array.isArray(u.classes) && u.classes.length > 0);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'assigned' && (hasClass || u.role === 'admin')) ||
      (statusFilter === 'unassigned' && !hasClass && u.role !== 'admin');

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  filteredUsers.sort((a, b) => {
    if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
    if (sortBy === 'role') return a.role.localeCompare(b.role);
    if (sortBy === 'id-desc') return b.id - a.id;
    return a.id - b.id;
  });

  return h(
    Card,
    null,
    h(
      'div',
      {
        style: {
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        },
      },
      h(
        'div',
        null,
        h(
          'h2',
          {
            style: {
              margin: 0,
              fontSize: '16px',
              fontWeight: '700',
              color: '#0f172a',
            },
          },
          'Danh bạ người dùng',
        ),
        h(
          'p',
          { style: { margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' } },
          `Hiển thị ${filteredUsers.length} trên tổng số ${users.length} tài khoản`,
        ),
      ),
      h(
        'span',
        {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            background: '#f1f5f9',
            padding: '2px 9px',
            borderRadius: '9999px',
          },
        },
        `${users.length} tài khoản`,
      ),
    ),
    h(UserDirectoryFilterBar, {
      searchTerm,
      setSearchTerm,
      roleFilter,
      setRoleFilter,
      statusFilter,
      setStatusFilter,
      sortBy,
      setSortBy,
    }),
    h(
      'div',
      { style: { overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' } },
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
              {
                style: { padding: '9px 12px', color: '#64748b', fontWeight: '600', width: '60px' },
              },
              'ID',
            ),
            h(
              'th',
              { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } },
              'Họ và tên',
            ),
            h(
              'th',
              { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } },
              'Tên đăng nhập',
            ),
            h(
              'th',
              { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } },
              'Vai trò',
            ),
            h(
              'th',
              { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } },
              'Trạng thái',
            ),
            h(
              'th',
              { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } },
              'Token',
            ),
            h(
              'th',
              { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } },
              'Lớp học đã tham gia',
            ),
          ),
        ),
        h(
          'tbody',
          null,
          filteredUsers.length === 0
            ? h(
                'tr',
                null,
                h(
                  'td',
                  { colSpan: 7, style: { textAlign: 'center', padding: '24px', color: '#94a3b8' } },
                  'Không tìm thấy tài khoản nào phù hợp với bộ lọc.',
                ),
              )
            : filteredUsers.map((u) =>
                h(UserTableRow, {
                  key: u.id,
                  user: u,
                  classes,
                  onOpenClassesModal: (user) => setSelectedUserForClasses(user),
                }),
              ),
        ),
      ),
    ),
    h(UserClassesModal, {
      user: selectedUserForClasses,
      classes,
      isOpen: Boolean(selectedUserForClasses),
      onClose: () => setSelectedUserForClasses(null),
    }),
  );
}
