import { h } from '../../../lib/react.js';
import { getUserClasses } from './userClassesHelper.js';
import { UserClassesTable } from './UserClassesTable.js';

export { getUserClasses };

export function UserClassesModal({ user, classes = [], isOpen, onClose }) {
  if (!isOpen || !user) return null;

  const userClasses = getUserClasses(user, classes);
  const roleLabel =
    user.role === 'admin' ? 'Quản trị viên' : user.role === 'ta' ? 'Giảng viên' : 'Sinh viên';

  return h(
    'div',
    {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      },
      onClick: onClose,
    },
    h(
      'div',
      {
        style: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        },
        onClick: (e) => e.stopPropagation(),
      },
      h(
        'div',
        {
          style: {
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          },
        },
        h(
          'div',
          null,
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
            'Danh sách lớp học đã tham gia',
          ),
          h(
            'p',
            { style: { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' } },
            `Người dùng: ${user.name} (@${user.username}) — ${roleLabel}`,
          ),
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: onClose,
            'aria-label': 'Đóng',
            style: {
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px 8px',
              borderRadius: '6px',
            },
          },
          '✕',
        ),
      ),
      h(
        'div',
        {
          style: {
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
          },
        },
        h(UserClassesTable, {
          userClasses,
          defaultRoleLabel: roleLabel,
        }),
      ),
      h(
        'div',
        {
          style: {
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          },
        },
        h(
          'button',
          {
            type: 'button',
            onClick: onClose,
            style: {
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
            },
          },
          'Đóng',
        ),
      ),
    ),
  );
}
