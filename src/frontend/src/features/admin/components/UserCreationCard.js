import { h, useState } from '../../../lib/react.js';
import { Card, Button, Input } from '../../../components/ui/index.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { PlusIcon } from './AdminIcons.js';

export function UserCreationCard({ classes, userCount, onCreateUser }) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [classId, setClassId] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password) {
      toast.error('Vui lòng điền đầy đủ Họ tên, Username và Mật khẩu');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setCreating(true);
    const ok = await onCreateUser({
      name: fullName.trim(),
      username: username.trim(),
      password,
      role,
      classId: classId ? Number(classId) : null,
    });
    if (ok) {
      setFullName('');
      setUsername('');
      setPassword('');
      setRole('student');
      setClassId('');
    }
    setCreating(false);
  };

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  };

  return h(
    Card,
    null,
    h(
      'div',
      {
        style: {
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        },
      },
      h(
        'div',
        null,
        h(
          'h2',
          { style: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' } },
          'Tạo tài khoản mới',
        ),
        h(
          'p',
          { style: { margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' } },
          'Cấp tài khoản cho giảng viên hoặc sinh viên trong hệ thống.',
        ),
      ),
      h(
        'span',
        {
          style: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            background: '#f1f5f9',
            padding: '2px 9px',
            borderRadius: '9999px',
          },
        },
        `${userCount} người dùng`,
      ),
    ),
    h(
      'form',
      {
        onSubmit: handleSubmit,
        style: { display: 'flex', flexDirection: 'column', gap: '14px' },
      },
      h(Input, {
        label: 'Họ và tên',
        placeholder: 'vd: Nguyễn Văn A',
        value: fullName,
        onChange: (e) => setFullName(e.target.value),
        required: true,
      }),
      h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          },
        },
        h(Input, {
          label: 'Tên đăng nhập',
          placeholder: 'vd: student_a, teacher_b',
          value: username,
          onChange: (e) => setUsername(e.target.value),
          required: true,
        }),
        h(Input, {
          label: 'Mật khẩu',
          type: 'password',
          placeholder: 'Tối thiểu 6 ký tự',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          required: true,
        }),
      ),
      h(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          },
        },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h(
            'label',
            { style: { fontSize: '13px', fontWeight: '500', color: '#334155' } },
            'Vai trò',
          ),
          h(
            'select',
            { value: role, onChange: (e) => setRole(e.target.value), style: selectStyle },
            h('option', { value: 'student' }, 'Sinh viên (Student)'),
            h('option', { value: 'ta' }, 'Giảng viên (Teacher / TA)'),
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h(
            'label',
            { style: { fontSize: '13px', fontWeight: '500', color: '#334155' } },
            'Lớp học ban đầu (Tùy chọn)',
          ),
          h(
            'select',
            { value: classId, onChange: (e) => setClassId(e.target.value), style: selectStyle },
            h('option', { value: '' }, '-- Chưa gán lớp --'),
            classes.map((c) => h('option', { key: c.id, value: c.id }, `${c.name} (#${c.id})`)),
          ),
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '4px' } },
        h(
          Button,
          {
            type: 'submit',
            variant: 'primary',
            disabled: creating,
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              padding: '8px 18px',
            },
          },
          h(PlusIcon, { size: 14 }),
          creating ? 'Đang tạo...' : 'Tạo tài khoản',
        ),
      ),
    ),
  );
}
