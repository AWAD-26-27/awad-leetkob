import { h } from '../../../lib/react.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { ALL_USERS } from '../../../config/constants.js';

export function UserSelectorBar() {
  const { user, switchUser } = useAuth();

  const handleSelect = (e) => {
    switchUser(e.target.value);
  };

  const roleBadgeClass =
    user.role === 'admin' ? 'badge-info' : user.role === 'ta' ? 'badge-warning' : 'badge-neutral';

  const roleColor = user.role === 'admin' ? '#8b5cf6' : user.role === 'ta' ? '#3b82f6' : '#10b981';

  // Fast demo role shortcuts
  const SHORTCUTS = [
    { username: 'ta_a', label: 'TA Alice (Class 1)' },
    { username: 'student_1', label: 'Student 1 (Class 1)' },
    { username: 'ta_b', label: 'TA Bob (Class 2)' },
    { username: 'admin', label: 'Admin' },
  ];

  return h(
    'header',
    {
      className: 'navbar-glassmorphism',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '14px 28px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.04)',
      },
    },
    // Left: Brand, Icon & Platform Title
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '14px' } },
      h(
        'div',
        {
          style: {
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '19px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          },
        },
        '⚡',
      ),
      h(
        'div',
        null,
        h(
          'div',
          {
            style: {
              fontWeight: '800',
              fontSize: '17px',
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            },
          },
          'LeeTKOB Judge',
          h(
            'span',
            {
              style: {
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#2563eb',
                fontWeight: '700',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              },
            },
            'v2.4 E2E',
          ),
        ),
        h(
          'div',
          { style: { fontSize: '12px', color: '#64748b', fontWeight: '500' } },
          'Automated C++20 Sandbox & Constraint Quality Gate',
        ),
      ),
    ),

    // Middle: Quick 1-click Role Switcher Pills
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f1f5f9',
          padding: '4px 6px',
          borderRadius: '10px',
        },
      },
      SHORTCUTS.map((s) => {
        const isActive = user.username === s.username;
        return h(
          'button',
          {
            key: s.username,
            type: 'button',
            onClick: () => switchUser(s.username),
            style: {
              background: isActive ? '#ffffff' : 'transparent',
              color: isActive ? '#0f172a' : '#64748b',
              fontWeight: isActive ? '700' : '500',
              fontSize: '11.5px',
              border: isActive ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid transparent',
              borderRadius: '7px',
              padding: '4px 10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
            },
          },
          s.label,
        );
      }),
    ),

    // Right: User Switcher Select (STRICTLY satisfies Playwright getByLabel('Signed in as') & #who)
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
      h(
        'label',
        {
          htmlFor: 'who',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--color-text-secondary)',
          },
        },
        'Signed in as',
        h(
          'select',
          {
            id: 'who',
            value: user.username,
            onChange: handleSelect,
            className: 'input-field',
            style: {
              padding: '6px 14px',
              fontSize: '13px',
              borderRadius: 'var(--radius-md)',
              minWidth: '150px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--card-border)',
              fontWeight: '600',
              cursor: 'pointer',
            },
          },
          h('option', { value: '' }, 'choose…'),
          ALL_USERS.map((u) =>
            h(
              'option',
              { key: u.username, value: u.username },
              `${u.username} (${u.role.toUpperCase()} - ${u.name})`,
            ),
          ),
        ),
      ),

      // User Profile Indicator
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '14px',
            borderLeft: '1px solid var(--color-border)',
          },
        },
        h(
          'div',
          {
            style: {
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: roleColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              boxShadow: `0 0 0 3px ${roleColor}25`,
            },
          },
          user.name.charAt(0).toUpperCase(),
        ),
        h(
          'div',
          null,
          h(
            'div',
            { style: { fontSize: '13.5px', fontWeight: '700', lineHeight: 1.2 } },
            user.name,
          ),
          h(
            'div',
            { style: { display: 'flex', gap: '6px', marginTop: '3px' } },
            h('span', { className: `badge ${roleBadgeClass}` }, user.role.toUpperCase()),
            h(
              'span',
              { className: 'badge badge-neutral' },
              user.classId ? `Class ${user.classId}` : 'All Classes',
            ),
          ),
        ),
      ),
    ),
  );
}
