import { h } from '../../lib/react.js';

export function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  onInput,
  placeholder = '',
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
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
    h('input', {
      id,
      type,
      className,
      value: value ?? '',
      onChange,
      onInput,
      placeholder,
      disabled,
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: '0.98rem',
        padding: '0.62rem 0.95rem',
        borderRadius: 'var(--radius-sm)',
        border: error ? '1px solid var(--danger)' : '1px solid var(--card-border)',
        outline: 'none',
        background: disabled ? '#f1f5f9' : '#ffffff',
        color: 'var(--text-main)',
        transition: 'border-color 0.15s ease',
      },
      ...props,
    }),
    error
      ? h('span', { style: { fontSize: '0.85rem', color: 'var(--danger)' } }, error)
      : helperText &&
          h('span', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, helperText),
  );
}
