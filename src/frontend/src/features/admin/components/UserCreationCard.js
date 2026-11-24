import { h, useState } from '../../../lib/react.js';
import { Card, Button, Input } from '../../../components/ui/index.js';
import { useToast } from '../../../providers/ToastProvider.js';

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

  return h(
    Card,
    null,
    h(
      'div',
      {
        style: {
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      h(
        'h3',
        {
          style: {
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          },
        },
        '👤 Cấp Phát Tài Khoản (Teacher & Student)',
      ),
      h(
        'span',
        {
          style: {
            fontSize: '12px',
            fontWeight: '700',
            color: '#10b981',
            background: '#ecfdf5',
            padding: '2px 8px',
            borderRadius: '6px',
          },
        },
        `${userCount} Tài khoản`,
      ),
    ),
    h(
      'form',
      {
        onSubmit: handleSubmit,
        style: { display: 'flex', flexDirection: 'column', gap: '14px' },
      },
      h(Input, {
        label: 'Họ và Tên đầy đủ (Full Name)',
        placeholder: 'vd: TS. Nguyen Van B hoặc Le Van C',
        value: fullName,
        onChange: (e) => setFullName(e.target.value),
        required: true,
      }),
      h(
        'div',
        { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
        h(Input, {
          label: 'Tên đăng nhập (Username)',
          placeholder: 'vd: teacher_c, stu_88',
          value: username,
          onChange: (e) => setUsername(e.target.value),
          required: true,
        }),
        h(Input, {
          label: 'Mật khẩu (Password)',
          type: 'password',
          placeholder: 'Tối thiểu 6 ký tự',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          required: true,
        }),
      ),
      h(
        'div',
        { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h('label', { style: { fontSize: '13px', fontWeight: '600', color: '#475569' } }, 'Vai trò (Role)'),
          h(
            'select',
            {
              value: role,
              onChange: (e) => setRole(e.target.value),
              style: {
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                fontWeight: '600',
              },
            },
            h('option', { value: 'student' }, '🎓 Sinh viên (Student)'),
            h('option', { value: 'ta' }, '👨‍🏫 Giảng viên / TA (Teacher)'),
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h('label', { style: { fontSize: '13px', fontWeight: '600', color: '#475569' } }, 'Gán Lớp (Tùy chọn)'),
          h(
            'select',
            {
              value: classId,
              onChange: (e) => setClassId(e.target.value),
              style: {
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                backgroundColor: '#ffffff',
              },
            },
            h('option', { value: '' }, '-- Chưa gán lớp --'),
            classes.map((c) => h('option', { key: c.id, value: c.id }, c.name)),
          ),
        ),
      ),
      h(
        Button,
        {
          type: 'submit',
          variant: 'primary',
          disabled: creating,
          style: { marginTop: '6px' },
        },
        creating ? 'Đang khởi tạo...' : '+ Khởi Tạo Tài Khoản Mới',
      ),
    ),
  );
}
