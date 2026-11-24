import { h } from '../../../lib/react.js';

export function LoginDemoQuickFill({ onSelectUser }) {
  const demoAccounts = [
    { label: 'Admin', user: 'admin' },
    { label: 'TA Alice (Lớp A)', user: 'ta_a' },
    { label: 'TA Bob (Lớp B)', user: 'ta_b' },
    { label: 'Sinh viên 1', user: 'student_1' },
  ];

  return h(
    'div',
    {
      style: {
        backgroundColor: '#f8fafc',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
      },
    },
    h(
      'div',
      { style: { fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '6px' } },
      'Tài khoản thử nghiệm nhanh:',
    ),
    h(
      'div',
      { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
      demoAccounts.map((d) =>
        h(
          'button',
          {
            key: d.user,
            type: 'button',
            onClick: () => onSelectUser(d.user, 'password123'),
            style: {
              padding: '4px 9px',
              fontSize: '11.5px',
              borderRadius: '5px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: '500',
            },
          },
          d.label,
        ),
      ),
    ),
  );
}
