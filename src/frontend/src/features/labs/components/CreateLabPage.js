import { h, useState } from '../../../lib/react.js';
import { Button, Input, Textarea, Card } from '../../../components/ui/index.js';
import { createLab } from '../api/index.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { TestCaseInputs } from './TestCaseInputs.js';
import { ConstraintInputs } from './ConstraintInputs.js';

/**
 * CreateLabPage — dedicated full-page UI for creating a new lab.
 * Rendered by TeacherClassWorkspace when showCreateLab=true.
 * Props:
 *   classId    — the class to attach the new lab to
 *   className  — display name for the breadcrumb
 *   onBack     — callback: cancel / return to class workspace
 *   onSuccess  — callback(newLab): lab created, return to class workspace
 */
export function CreateLabPage({ classId, className, onBack, onSuccess }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
  const [constraints, setConstraints] = useState([{ code: 'C1', text: '', deduction: 2.0 }]);
  const [submitting, setSubmitting] = useState(false);

  const addTestCase = () => setTestCases([...testCases, { input: '', output: '' }]);
  const removeTestCase = (idx) => setTestCases(testCases.filter((_, i) => i !== idx));
  const updateTestCase = (idx, field, val) => {
    const next = [...testCases];
    next[idx][field] = val;
    setTestCases(next);
  };

  const addConstraint = () => {
    const nextCode = `C${constraints.length + 1}`;
    setConstraints([...constraints, { code: nextCode, text: '', deduction: 2.0 }]);
  };
  const removeConstraint = (idx) => setConstraints(constraints.filter((_, i) => i !== idx));
  const updateConstraint = (idx, field, val) => {
    const next = [...constraints];
    next[idx][field] = field === 'deduction' ? (val === '' ? '' : parseFloat(val) || 0) : val;
    setConstraints(next);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!title.trim() || !statement.trim()) {
      toast.error('Tiêu đề và đề bài không được để trống');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createLab({
        classId,
        title,
        statement,
        statementMd: statement,
        testCases: testCases.map((tc, idx) => ({
          ordinal: idx + 1,
          input: tc.input,
          inputText: tc.input,
          output: tc.output,
          expectedOutput: tc.output,
        })),
        constraints: constraints.map((c) => ({
          code: c.code,
          text: c.text,
          deduction: typeof c.deduction === 'number' ? c.deduction : parseFloat(c.deduction) || 0,
        })),
      });
      toast.success('Đã tạo bài thực hành thành công!');
      if (onSuccess) onSuccess(res);
    } catch (err) {
      toast.error(err.detail || err.message || 'Lỗi tạo bài thực hành');
    } finally {
      setSubmitting(false);
    }
  };

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },

    // Page Header / Breadcrumb
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 24px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
        },
      },
      h(
        Button,
        {
          variant: 'outline',
          onClick: onBack,
          style: { fontSize: '13px', padding: '6px 14px', flexShrink: 0 },
        },
        '← Trở về lớp học',
      ),
      h(
        'div',
        null,
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          h(
            'span',
            { style: { fontSize: '13px', color: '#64748b' } },
            className || `Lớp #${classId}`,
          ),
          h('span', { style: { fontSize: '13px', color: '#94a3b8' } }, '/'),
          h(
            'span',
            { style: { fontSize: '13px', color: '#2563eb', fontWeight: '600' } },
            'Tạo bài thực hành mới',
          ),
        ),
        h(
          'h2',
          {
            style: {
              fontSize: '20px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '4px 0 0 0',
            },
          },
          '🧪 Tạo Bài Thực Hành Mới',
        ),
      ),
    ),

    // Info banner
    h(
      'div',
      {
        style: {
          padding: '12px 16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          fontSize: '13.5px',
          color: '#1e40af',
        },
      },
      '💡 Điền đầy đủ tiêu đề, đề bài, test cases và ràng buộc. Bài lab sẽ ở trạng thái Bản nháp cho đến khi bạn công bố.',
    ),

    // Form body
    h(
      Card,
      {
        style: {
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
        },
      },
      h(
        'form',
        {
          onSubmit: handleSubmit,
          style: { display: 'flex', flexDirection: 'column', gap: '16px' },
        },
        h(Input, {
          label: 'Tiêu đề bài thực hành',
          placeholder: 'vd: Lab 3: Sắp xếp mảng và tìm phần tử',
          value: title,
          onChange: (e) => setTitle(e.target.value),
          required: true,
        }),
        h(Textarea, {
          label: 'Đề bài & Yêu cầu (Markdown)',
          placeholder: 'Mô tả chi tiết yêu cầu bài toán, định dạng dữ liệu vào/ra...',
          rows: 5,
          value: statement,
          onChange: (e) => setStatement(e.target.value),
          required: true,
        }),
        h(TestCaseInputs, {
          testCases,
          onAdd: addTestCase,
          onRemove: removeTestCase,
          onUpdate: updateTestCase,
        }),
        h(ConstraintInputs, {
          constraints,
          onAdd: addConstraint,
          onRemove: removeConstraint,
          onUpdate: updateConstraint,
        }),
        h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
            },
          },
          h(Button, { variant: 'outline', onClick: onBack }, '← Hủy, quay lại'),
          h(
            Button,
            { variant: 'primary', type: 'submit', loading: submitting },
            'Tạo bài thực hành',
          ),
        ),
      ),
    ),
  );
}
