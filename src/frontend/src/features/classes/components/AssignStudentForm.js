import { h, useState } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function AssignStudentForm({
  candidateStudents = [],
  onAssign,
  onRefresh,
  assigning,
  loading,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!selectedStudentId) return;
    const ok = await onAssign(selectedStudentId);
    if (ok) setSelectedStudentId('');
  };

  const hasCandidates = candidateStudents && candidateStudents.length > 0;

  return h(
    'form',
    {
      onSubmit: handleSubmit,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#f8fafc',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        flexWrap: 'wrap',
      },
    },
    h(
      'span',
      { style: { fontSize: '13.5px', fontWeight: '600', color: '#334155' } },
      'Thêm sinh viên vào lớp:',
    ),
    h(
      'select',
      {
        value: selectedStudentId,
        onChange: (e) => setSelectedStudentId(e.target.value),
        disabled: assigning || !hasCandidates,
        style: {
          flex: 1,
          minWidth: '220px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          fontSize: '13px',
          backgroundColor: '#ffffff',
        },
      },
      h(
        'option',
        { value: '' },
        hasCandidates
          ? `-- Chọn sinh viên để gán (${candidateStudents.length} khả dụng) --`
          : '-- Tất cả sinh viên đã được gán vào lớp này --',
      ),
      candidateStudents.map((s) => {
        const classNote = s.classId
          ? `[Đang ở: ${s.className || `Class ${s.classId}`}]`
          : '[Chưa có lớp]';
        return h('option', { key: s.id, value: s.id }, `${s.name} (@${s.username}) ${classNote}`);
      }),
    ),
    h(
      Button,
      {
        type: 'submit',
        variant: 'primary',
        disabled: assigning || !selectedStudentId,
        size: 'sm',
      },
      assigning ? 'Đang thêm...' : '+ Thêm vào lớp',
    ),
    onRefresh &&
      h(
        Button,
        {
          type: 'button',
          variant: 'secondary',
          onClick: onRefresh,
          disabled: loading,
          size: 'sm',
        },
        '🔄 Làm mới',
      ),
  );
}
