import { h } from '../../../lib/react.js';
import { Button, Textarea } from '../../../components/ui/index.js';

export function TestCaseInputs({ testCases, onAdd, onRemove, onUpdate }) {
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
        'Bộ dữ liệu kiểm thử (Test Cases)',
      ),
      h(Button, { variant: 'ghost', size: 'sm', onClick: onAdd }, '+ Thêm Test Case'),
    ),
    testCases.map((tc, idx) =>
      h(
        'div',
        {
          key: idx,
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '8px',
          },
        },
        h(Textarea, {
          id: `test-case-input-${idx}`,
          rows: 2,
          placeholder: 'Dữ liệu đầu vào (Input)',
          value: tc.input,
          onInput: (e) => onUpdate(idx, 'input', e.target.value),
        }),
        h(Textarea, {
          id: `test-case-output-${idx}`,
          rows: 2,
          placeholder: 'Kết quả kỳ vọng (Output)',
          value: tc.output,
          onInput: (e) => onUpdate(idx, 'output', e.target.value),
        }),
        testCases.length > 1 &&
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
