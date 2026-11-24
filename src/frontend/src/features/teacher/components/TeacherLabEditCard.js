import { h } from '../../../lib/react.js';
import { Card, Button, Input, Textarea } from '../../../components/ui/index.js';

export function TeacherLabEditCard({
  editTitle,
  setEditTitle,
  editStatement,
  setEditStatement,
  onCancel,
  onSave,
}) {
  return h(
    Card,
    { style: { padding: '16px 20px', border: '1px solid #bfdbfe', borderRadius: '12px' } },
    h(
      'h3',
      { style: { fontSize: '15px', fontWeight: '700', margin: '0 0 10px' } },
      'Chỉnh Sửa Tiêu Đề & Đề Bài',
    ),
    h(Input, {
      label: 'Tiêu đề:',
      value: editTitle,
      onChange: (e) => setEditTitle(e.target.value),
    }),
    h(Textarea, {
      label: 'Nội dung đề bài (Markdown):',
      value: editStatement,
      onChange: (e) => setEditStatement(e.target.value),
      rows: 4,
    }),
    h(
      'div',
      { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' } },
      h(Button, { variant: 'outline', size: 'sm', onClick: onCancel }, 'Hủy'),
      h(Button, { variant: 'primary', size: 'sm', onClick: onSave }, 'Lưu thay đổi'),
    ),
  );
}
