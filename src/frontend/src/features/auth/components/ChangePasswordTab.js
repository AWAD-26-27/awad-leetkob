import { h, useState } from '../../../lib/react.js';
import { Button, Input } from '../../../components/ui/index.js';
import { useToast } from '../../../providers/ToastProvider.js';

export function ChangePasswordTab({ onChangePassword, onSuccess }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setUpdatingPassword(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess();
    } catch (err) {
      const errMsg =
        err?.title === 'Incorrect current password'
          ? 'Mật khẩu hiện tại không chính xác'
          : err?.detail || err?.title || err?.message || 'Đổi mật khẩu thất bại';
      toast.error(errMsg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return h(
    'form',
    { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    h(Input, {
      id: 'current-password',
      type: 'password',
      label: 'Mật khẩu hiện tại (Current Password)',
      placeholder: 'Nhập mật khẩu hiện tại...',
      value: currentPassword,
      onChange: (e) => setCurrentPassword(e.target.value),
      required: true,
    }),
    h(Input, {
      id: 'new-password',
      type: 'password',
      label: 'Mật khẩu mới (New Password)',
      placeholder: 'Tối thiểu 6 ký tự...',
      value: newPassword,
      onChange: (e) => setNewPassword(e.target.value),
      required: true,
    }),
    h(Input, {
      id: 'confirm-password',
      type: 'password',
      label: 'Xác nhận mật khẩu mới',
      placeholder: 'Nhập lại mật khẩu mới...',
      value: confirmPassword,
      onChange: (e) => setConfirmPassword(e.target.value),
      required: true,
    }),
    h(
      Button,
      {
        type: 'submit',
        variant: 'primary',
        loading: updatingPassword,
        onClick: handleSubmit,
        style: { marginTop: '8px', padding: '10px', fontWeight: '700' },
      },
      'Lưu Thay Đổi Mật Khẩu',
    ),
  );
}
