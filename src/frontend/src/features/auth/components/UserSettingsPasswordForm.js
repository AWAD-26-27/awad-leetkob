import { h, useState } from '../../../lib/react.js';
import { Button, Input } from '../../../components/ui/index.js';
import { useToast } from '../../../providers/ToastProvider.js';

export function UserSettingsPasswordForm({ onChangePassword, onSuccess }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp');
      return;
    }
    setUpdating(true);
    try {
      if (onChangePassword) {
        await onChangePassword(currentPassword, newPassword);
      }
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        err?.title === 'Incorrect current password'
          ? 'Mật khẩu hiện tại không chính xác'
          : err?.detail || err?.title || err?.message || 'Đổi mật khẩu thất bại';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  return h(
    'form',
    { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    h(
      'div',
      { style: { fontWeight: '700', fontSize: '15px', color: '#0f172a' } },
      '🔑 Đổi mật khẩu',
    ),
    h(Input, {
      id: 'setting-curr-pass',
      type: 'password',
      label: 'Mật khẩu hiện tại',
      placeholder: 'Nhập mật khẩu hiện tại...',
      value: currentPassword,
      onChange: (e) => setCurrentPassword(e.target.value),
    }),
    h(Input, {
      id: 'setting-new-pass',
      type: 'password',
      label: 'Mật khẩu mới',
      placeholder: 'Tối thiểu 6 ký tự...',
      value: newPassword,
      onChange: (e) => setNewPassword(e.target.value),
    }),
    h(Input, {
      id: 'setting-confirm-pass',
      type: 'password',
      label: 'Xác nhận mật khẩu mới',
      placeholder: 'Nhập lại mật khẩu mới...',
      value: confirmPassword,
      onChange: (e) => setConfirmPassword(e.target.value),
    }),
    h(
      Button,
      {
        type: 'submit',
        variant: 'secondary',
        loading: updating,
        style: { alignSelf: 'flex-start', padding: '9px 18px', fontWeight: '600' },
      },
      '🔒 Cập Nhật Mật Khẩu',
    ),
  );
}
