import { h } from '../../../lib/react.js';
import { Button, Input } from '../../../components/ui/index.js';

export function ConstraintInputs({ constraints, onAdd, onRemove, onUpdate }) {
  return h(
    'div',
    null,
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        },
      },
      h(
        'label',
        {
          style: { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' },
        },
        'Quy tắc ràng buộc (Constraint Rules)',
      ),
      h(Button, { variant: 'ghost', size: 'sm', onClick: onAdd }, '+ Thêm ràng buộc'),
    ),
    constraints.map((c, idx) =>
      h(
        'div',
        {
          key: idx,
          style: {
            display: 'grid',
            gridTemplateColumns: '80px 1fr 110px auto',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '8px',
          },
        },
        h(Input, {
          placeholder: 'Mã (C1)',
          value: c.code,
          onChange: (e) => onUpdate(idx, 'code', e.target.value),
        }),
        h(Input, {
          placeholder: 'Mô tả quy tắc (vd: Không dùng recursion)',
          value: c.text,
          onChange: (e) => onUpdate(idx, 'text', e.target.value),
        }),
        h(Input, {
          type: 'number',
          placeholder: 'Điểm trừ',
          value: c.deduction,
          onChange: (e) => onUpdate(idx, 'deduction', e.target.value),
        }),
        constraints.length > 1 &&
          h(
            Button,
            {
              variant: 'danger',
              size: 'sm',
              onClick: () => onRemove(idx),
              style: { padding: '8px 12px' },
            },
            '✕',
          ),
      ),
    ),
  );
}
