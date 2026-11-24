import { h } from '../../../lib/react.js';

function getRoleLabel(role, classId) {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'ta') return classId ? `Giảng viên (Lớp ${classId})` : 'Giảng viên';
  if (role === 'student') return classId ? `Sinh viên (Lớp ${classId})` : 'Sinh viên';
  return role || 'Người dùng';
}

function getRoleColor(role) {
  if (role === 'admin') return '#8b5cf6';
  if (role === 'ta') return '#2563eb';
  if (role === 'student') return '#10b981';
  return '#64748b';
}

function getRoleBadgeBg(role) {
  if (role === 'admin') return '#f5f3ff';
  if (role === 'ta') return '#eff6ff';
  if (role === 'student') return '#ecfdf5';
  return '#f1f5f9';
}

/**
 * Quick Login Component: Displays accounts previously authenticated with a password.
 * When an account is clicked, logs directly into that session without re-entering password.
 */
export function LoginDemoQuickFill({ savedAccounts = [], onDirectLogin, onRemoveAccount }) {
  if (!savedAccounts || savedAccounts.length === 0) {
    return h(
      'div',
      {
        style: {
          backgroundColor: '#f8fafc',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1',
          textAlign: 'center',
          marginTop: '4px',
        },
      },
      h(
        'div',
        { style: { fontSize: '12px', color: '#64748b', fontWeight: '500' } },
        'Chưa có tài khoản nào được lưu trên thiết bị này.',
      ),
      h(
        'div',
        { style: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' } },
        'Sau khi đăng nhập bằng mật khẩu, tài khoản sẽ được lưu tại đây để đăng nhập nhanh.',
      ),
    );
  }

  return h(
    'div',
    {
      style: {
        backgroundColor: '#f8fafc',
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginTop: '4px',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        },
      },
      h(
        'div',
        { style: { fontSize: '12px', color: '#475569', fontWeight: '600' } },
        'Tài khoản đã đăng nhập trên thiết bị này:',
      ),
      h(
        'span',
        {
          style: {
            fontSize: '11px',
            color: '#64748b',
            backgroundColor: '#e2e8f0',
            padding: '1px 7px',
            borderRadius: '10px',
            fontWeight: '600',
          },
        },
        `${savedAccounts.length}`,
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      savedAccounts.map((acc) => {
        const roleColor = getRoleColor(acc.role);
        const roleBg = getRoleBadgeBg(acc.role);
        const roleLabel = getRoleLabel(acc.role, acc.classId);

        return h(
          'div',
          {
            key: acc.username,
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            },
          },
          // Direct login button: logs straight in with session
          h(
            'button',
            {
              type: 'button',
              onClick: () => onDirectLogin && onDirectLogin(acc),
              title: `Đăng nhập trực tiếp với ${acc.name || acc.username}`,
              style: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
              },
            },
            h(
              'div',
              {
                style: {
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: roleColor,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  flexShrink: 0,
                },
              },
              (acc.name || acc.username || 'U').charAt(0).toUpperCase(),
            ),
            h(
              'div',
              { style: { flex: 1, minWidth: 0 } },
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                h(
                  'span',
                  {
                    style: {
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  },
                  acc.name || acc.username,
                ),
                h(
                  'span',
                  {
                    style: {
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      color: roleColor,
                      backgroundColor: roleBg,
                      border: `1px solid ${roleColor}22`,
                      flexShrink: 0,
                    },
                  },
                  roleLabel,
                ),
              ),
              h('div', { style: { fontSize: '11.5px', color: '#64748b' } }, `@${acc.username}`),
            ),
            h(
              'span',
              {
                style: {
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  flexShrink: 0,
                },
              },
              'Đăng nhập →',
            ),
          ),
          // Forget / remove from saved accounts
          h(
            'button',
            {
              type: 'button',
              title: 'Xóa tài khoản này khỏi thiết bị',
              onClick: (e) => {
                e.stopPropagation();
                if (onRemoveAccount) onRemoveAccount(acc.username);
              },
              style: {
                marginLeft: '8px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
                lineHeight: 1,
              },
            },
            '✕',
          ),
        );
      }),
    ),
  );
}

export { LoginDemoQuickFill as SavedAccountsQuickLogin };
