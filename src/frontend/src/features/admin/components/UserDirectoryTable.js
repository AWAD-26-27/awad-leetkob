import { h, useState } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { SearchIcon } from './AdminIcons.js';

export function UserDirectoryTable({ users = [], classes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id-asc');

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchTerm.trim() ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const hasClass = u.classId !== null && u.classId !== undefined;
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
    // Filter & Search Toolbar
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          backgroundColor: '#f8fafc',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        },
      },
      h(
        'div',
        {
          style: {
            position: 'relative',
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            alignItems: 'center',
          },
        },
        h(SearchIcon, {
          size: 14,
          style: {
            position: 'absolute',
            left: '10px',
            color: '#94a3b8',
            pointerEvents: 'none',
          },
        }),
        h('input', {
          type: 'text',
          placeholder: 'Tìm theo tên hoặc username...',
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          style: {
            width: '100%',
            padding: '7px 10px 7px 32px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            outline: 'none',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
          },
        }),
      ),
      h(
        'select',
        {
          value: roleFilter,
          onChange: (e) => setRoleFilter(e.target.value),
          style: {
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
          },
        },
        h('option', { value: 'all' }, 'Tất cả vai trò'),
        h('option', { value: 'admin' }, 'Quản trị viên'),
        h('option', { value: 'ta' }, 'Giảng viên'),
        h('option', { value: 'student' }, 'Sinh viên'),
      ),
      h(
        'select',
        {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          style: {
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
          },
        },
        h('option', { value: 'all' }, 'Tất cả trạng thái'),
        h('option', { value: 'assigned' }, 'Đã vào lớp'),
        h('option', { value: 'unassigned' }, 'Chưa có lớp'),
      ),
      h(
        'select',
        {
          value: sortBy,
          onChange: (e) => setSortBy(e.target.value),
          style: {
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
          },
        },
        h('option', { value: 'id-asc' }, 'ID tăng dần'),
        h('option', { value: 'id-desc' }, 'Mới nhất (ID giảm)'),
        h('option', { value: 'name-asc' }, 'Tên A-Z'),
        h('option', { value: 'role' }, 'Theo vai trò'),
      ),
    ),
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
            { style: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' } },
            h('th', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600', width: '60px' } }, 'ID'),
            h('th', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } }, 'Họ và tên'),
            h('th', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } }, 'Tên đăng nhập'),
            h('th', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } }, 'Vai trò'),
            h('th', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } }, 'Lớp phụ trách / Học tập'),
            h('th', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } }, 'Trạng thái'),
            h('th', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '600' } }, 'Token'),
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
            : filteredUsers.map((u) => {
              const roleConfig =
                u.role === 'admin'
                  ? { label: 'Quản trị viên', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' }
                  : u.role === 'ta'
                    ? { label: 'Giảng viên', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' }
                    : { label: 'Sinh viên', color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };

              const userClass = classes.find((c) => c.id === u.classId);
              const isAssigned = Boolean(userClass) || u.role === 'admin';

              return h(
                'tr',
                { key: u.id, style: { borderBottom: '1px solid #f1f5f9' } },
                h('td', { style: { padding: '9px 12px', color: '#64748b', fontWeight: '500' } }, `#${u.id}`),
                h('td', { style: { padding: '9px 12px', fontWeight: '600', color: '#0f172a' } }, u.name),
                h(
                  'td',
                  { style: { padding: '9px 12px', fontFamily: 'monospace', color: '#475569', fontSize: '12px' } },
                  `@${u.username}`,
                ),
                h(
                  'td',
                  { style: { padding: '9px 12px' } },
                  h(
                    'span',
                    {
                      style: {
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: roleConfig.color,
                        backgroundColor: roleConfig.bg,
                        border: `1px solid ${roleConfig.border}`,
                      },
                    },
                    roleConfig.label,
                  ),
                ),
                h(
                  'td',
                  { style: { padding: '9px 12px', color: '#334155' } },
                  userClass
                    ? `${userClass.name} (#${userClass.id})`
                    : u.role === 'admin'
                      ? 'Toàn hệ thống'
                      : '—',
                ),
                h(
                  'td',
                  { style: { padding: '9px 12px' } },
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: '500',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: isAssigned ? '#ecfdf5' : '#fffbeb',
                        color: isAssigned ? '#065f46' : '#92400e',
                        border: `1px solid ${isAssigned ? '#a7f3d0' : '#fde68a'}`,
                      },
                    },
                    isAssigned ? 'Đã gán lớp' : 'Chưa có lớp',
                  ),
                ),
                h(
                  'td',
                  { style: { padding: '9px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#64748b' } },
                  u.token
                    ? h(
                      'code',
                      {
                        style: {
                          backgroundColor: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          border: '1px solid #e2e8f0',
                        },
                      },
                      u.token,
                    )
                    : '—',
                ),
              );
            }),
        ),
      ),
    ),
  );
}
