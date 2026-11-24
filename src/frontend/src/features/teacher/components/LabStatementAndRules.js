import { h } from '../../../lib/react.js';
import { Card, Badge } from '../../../components/ui/index.js';

export function LabStatementAndRules({ lab }) {
  if (!lab) return null;

  const testCases = lab.testCases || lab.tests || [];
  const constraints = lab.constraints || [];

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    // Statement
    h(
      Card,
      { style: { padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' } },
        h('span', { style: { fontSize: '18px' } }, '📖'),
        h(
          'h3',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          'Đề Bài & Yêu Cầu',
        ),
      ),
      h(
        'div',
        {
          style: {
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#334155',
            backgroundColor: '#f8fafc',
            padding: '16px 20px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            whiteSpace: 'pre-wrap',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
        },
        lab.statement || 'Chưa có đề bài.',
      ),
    ),

    // AST Constraints
    h(
      Card,
      { style: { padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' } },
        h('span', { style: { fontSize: '18px' } }, '⚡'),
        h(
          'h3',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          `Quy Tắc Ràng Buộc Kỹ Thuật (${constraints.length})`,
        ),
      ),
      constraints.length === 0
        ? h(
            'div',
            { style: { color: '#64748b', fontSize: '13.5px' } },
            'Không có ràng buộc kỹ thuật nào cho bài thực hành này.',
          )
        : h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
            constraints.map((c, i) =>
              h(
                'div',
                {
                  key: i,
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                  h(Badge, { variant: 'warning' }, c.code),
                  h(
                    'span',
                    { style: { fontSize: '13.5px', color: '#92400e', fontWeight: '500' } },
                    c.text,
                  ),
                ),
                h(
                  'span',
                  { style: { fontSize: '13px', fontWeight: '700', color: '#b45309' } },
                  `Trừ ${c.deduction ?? 1} điểm`,
                ),
              ),
            ),
          ),
    ),

    // Test cases
    h(
      Card,
      { style: { padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' } },
        h('span', { style: { fontSize: '18px' } }, '🧪'),
        h(
          'h3',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          `Bộ Dữ Liệu Kiểm Thử (${testCases.length} Test cases)`,
        ),
      ),
      testCases.length === 0
        ? h('div', { style: { color: '#64748b', fontSize: '13.5px' } }, 'Chưa có bộ test case nào.')
        : h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
            testCases.map((tc, idx) =>
              h(
                'div',
                {
                  key: idx,
                  style: {
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                  },
                },
                h(
                  'div',
                  {
                    style: {
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: '#475569',
                      marginBottom: '6px',
                    },
                  },
                  `Test case #${tc.ordinal || idx + 1}`,
                ),
                h(
                  'div',
                  { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
                  h(
                    'div',
                    null,
                    h(
                      'span',
                      { style: { fontSize: '11.5px', color: '#64748b', fontWeight: '600' } },
                      'INPUT:',
                    ),
                    h(
                      'pre',
                      {
                        style: {
                          margin: '4px 0 0',
                          padding: '8px',
                          background: '#ffffff',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        },
                      },
                      tc.input || tc.inputText || '(empty)',
                    ),
                  ),
                  h(
                    'div',
                    null,
                    h(
                      'span',
                      { style: { fontSize: '11.5px', color: '#64748b', fontWeight: '600' } },
                      'EXPECTED OUTPUT:',
                    ),
                    h(
                      'pre',
                      {
                        style: {
                          margin: '4px 0 0',
                          padding: '8px',
                          background: '#ffffff',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        },
                      },
                      tc.expectedOutput || '(empty)',
                    ),
                  ),
                ),
              ),
            ),
          ),
    ),
  );
}
