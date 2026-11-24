import { h } from '../../../lib/react.js';
import { ALL_USERS } from '../../../config/constants.js';

export function PlaywrightUserSelector({ currentUsername, onSelect }) {
  return h(
    'div',
    {
      style: {
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '1px',
        height: '1px',
        opacity: 0.001,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: -999,
      },
    },
    h(
      'label',
      { htmlFor: 'who' },
      'Signed in as',
      h(
        'select',
        {
          id: 'who',
          value: currentUsername,
          onChange: onSelect,
        },
        h('option', { value: '' }, 'choose…'),
        ALL_USERS.map((u) =>
          h('option', { key: u.username, value: u.username }, `${u.username} (${u.role})`),
        ),
      ),
    ),
  );
}
