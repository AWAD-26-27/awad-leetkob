import { h } from '../../../lib/react.js';
import { SearchIcon } from './AdminIcons.js';

export function UserDirectoryFilterBar({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}) {
  return h(
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
  );
}
