import { h, useState } from '../../../lib/react.js';
import { Button, Input, Textarea, Card } from '../../../components/ui/index.js';
import { createLab } from '../api/index.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { TestCaseInputs } from './TestCaseInputs.js';
import { ConstraintInputs } from './ConstraintInputs.js';

export function CreateLabForm({ onSuccess }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
  const [constraints, setConstraints] = useState([
    { code: 'C1', text: '', deduction: 2.0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    next[idx][field] = field === 'deduction' ? parseFloat(val) || 0 : val;
    setConstraints(next);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!title.trim() || !statement.trim()) {
      toast.error('Title and statement are required');
      return;
    }

    setSubmitting(true);
    try {
      await createLab({
        title,
        statement,
        statementMd: statement,
        testCases: testCases.map((tc, idx) => ({
          ordinal: idx + 1,
          inputText: tc.input,
          expectedOutput: tc.output,
        })),
        constraints,
      });
      toast.success('Lab created successfully');
      setTitle('');
      setStatement('');
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.detail || err.message || 'Failed to create lab');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return h(
      'div',
      { style: { marginBottom: '16px' } },
      h(
        Button,
        {
          variant: 'primary',
          size: 'sm',
          onClick: () => setIsOpen(true),
        },
        '+ Create New Lab',
      ),
    );
  }

  return h(
    Card,
    {
      title: 'Create New Laboratory Assignment',
      style: { marginBottom: '24px' },
    },
    h(
      'form',
      { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h(Input, {
        label: 'Lab Title',
        placeholder: 'e.g. Lab 3: Array Sorting & Unique Elements',
        value: title,
        onChange: (e) => setTitle(e.target.value),
        required: true,
      }),
      h(Textarea, {
        label: 'Problem Statement (Markdown)',
        placeholder: 'Write the problem specification, input/output format, and constraints...',
        rows: 4,
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
        { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' } },
        h(Button, { variant: 'secondary', size: 'sm', onClick: () => setIsOpen(false) }, 'Cancel'),
        h(
          Button,
          { variant: 'primary', size: 'sm', type: 'submit', loading: submitting },
          'Create Lab Assignment',
        ),
      ),
    ),
  );
}
