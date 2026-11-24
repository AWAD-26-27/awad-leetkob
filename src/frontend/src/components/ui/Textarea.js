import { h } from '../../lib/react.js';

export function Textarea({
  label,
  id,
  value,
  onChange,
  rows = 4,
  placeholder = '',
  helperText,
  error,
  disabled = false,
  required = false,
  style = {},
  ...props
}) {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' } },
    label &&
      h(
        'label',
        {
          htmlFor: id,
          style: { fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' },
        },
        label,
        required && h('span', { style: { color: 'var(--danger)', marginLeft: '4px' } }, '*'),
      ),
    h('textarea', {
      id,
      value: value ?? '',
      onChange,
      rows,
      placeholder,
      disabled,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.95rem',
        padding: '0.7rem 0.95rem',
        borderRadius: 'var(--radius-sm)',
        border: error ? '1px solid var(--danger)' : '1px solid var(--card-border)',
        outline: 'none',
        background: disabled ? '#f1f5f9' : '#ffffff',
        color: 'var(--text-main)',
        resize: 'vertical',
        lineHeight: 1.5,
        ...style,
      },
      ...props,
    }),
    error
      ? h('span', { style: { fontSize: '0.85rem', color: 'var(--danger)' } }, error)
      : helperText &&
          h('span', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, helperText),
  );
}
