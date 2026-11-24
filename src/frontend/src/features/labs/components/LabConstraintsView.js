import { h } from '../../../lib/react.js';
import { Badge } from '../../../components/ui/index.js';

export function LabConstraintsView({ constraints }) {
  return h(
    'div',
    { className: 'animate-fade-in', style: { marginBottom: '16px' } },
    constraints && constraints.length > 0
      ? h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          constraints.map((c) =>
            h(
              'div',
              {
                key: c.code,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                },
              },
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                h(
                  Badge,
                  {
                    variant: 'info',
                    style: { fontFamily: 'var(--font-mono)', fontWeight: '700' },
                  },
                  c.code,
                ),
                h('span', { style: { fontWeight: '500', color: '#1e293b' } }, c.text),
              ),
              h(
                Badge,
                {
                  variant: 'danger',
                  style: { fontWeight: '700', padding: '3px 8px' },
                },
                `-${c.deduction} pts`,
              ),
            ),
          ),
        )
      : h(
          'div',
          { style: { color: '#64748b', fontSize: '13px' } },
          'Không có ràng buộc kỹ thuật nào.',
        ),
  );
}
