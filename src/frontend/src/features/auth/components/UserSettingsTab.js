import { h, useState } from '../../../lib/react.js';
import { Button, Input } from '../../../components/ui/index.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { UserSettingsPasswordForm } from './UserSettingsPasswordForm.js';

const AVATAR_PRESETS = ['👨‍💻', '👩‍💻', '🧑‍🔬', '⚡', '🚀', '⭐', '🐱', '🦊'];

export function UserSettingsTab({ user, onUpdateProfile, onChangePassword, onSuccess }) {
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!name.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    setSavingProfile(true);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({
          name: name.trim(),
          avatar: avatar.trim() || null,
          phone: phone.trim() || null,
        });
      }
      toast.success('Đã lưu thông tin tài khoản thành công!');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.detail || err?.title || err?.message || 'Lưu thông tin thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const isImageAvatar = avatar && (avatar.startsWith('http') || avatar.startsWith('data:image'));

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    // Section 1: Thông tin cá nhân
    h(
      'form',
      {
        onSubmit: handleSaveProfile,
        style: { display: 'flex', flexDirection: 'column', gap: '14px' },
      },
      h(
        'div',
        { style: { fontWeight: '700', fontSize: '15px', color: '#0f172a' } },
        '👤 Thông tin cá nhân',
      ),
      // Avatar Picker & Preview
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          },
        },
        h(
          'div',
          {
            style: {
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isImageAvatar ? '14px' : '22px',
              fontWeight: '700',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            },
          },
          isImageAvatar
            ? h('img', {
                src: avatar,
                alt: 'Avatar',
                style: { width: '100%', height: '100%', objectFit: 'cover' },
              })
            : avatar || name.charAt(0).toUpperCase() || 'U',
        ),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 } },
          h(
            'div',
            { style: { fontSize: '12px', fontWeight: '600', color: '#475569' } },
            'Chọn nhanh Avatar hoặc nhập URL bên dưới:',
          ),
          h(
            'div',
            { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } },
            AVATAR_PRESETS.map((preset) =>
              h(
                'button',
                {
                  key: preset,
                  type: 'button',
                  onClick: () => setAvatar(preset),
                  style: {
                    border: avatar === preset ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                    backgroundColor: avatar === preset ? '#eff6ff' : '#ffffff',
                    borderRadius: '6px',
                    padding: '3px 7px',
                    fontSize: '15px',
                    cursor: 'pointer',
                  },
                },
                preset,
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                onClick: () => setAvatar(''),
                style: {
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                },
              },
              'Mặc định',
            ),
          ),
        ),
      ),
      h(Input, {
        id: 'setting-avatar',
        type: 'text',
        label: 'URL Ảnh đại diện (hoặc icon tùy chọn)',
        placeholder: 'https://... hoặc nhập emoji bất kỳ',
        value: avatar,
        onChange: (e) => setAvatar(e.target.value),
      }),
      h(Input, {
        id: 'setting-name',
        type: 'text',
        label: 'Họ và tên hiển thị',
        placeholder: 'Nhập họ và tên...',
        value: name,
        onChange: (e) => setName(e.target.value),
        required: true,
      }),
      h(Input, {
        id: 'setting-phone',
        type: 'tel',
        label: 'Số điện thoại',
        placeholder: 'vd: 0912345678',
        value: phone,
        onChange: (e) => setPhone(e.target.value),
      }),
      h(
        Button,
        {
          type: 'submit',
          variant: 'primary',
          loading: savingProfile,
          style: { alignSelf: 'flex-start', padding: '9px 18px', fontWeight: '600' },
        },
        '💾 Lưu Thông Tin Cá Nhân',
      ),
    ),

    // Divider
    h('div', { style: { height: '1px', backgroundColor: '#e2e8f0' } }),

    // Section 2: Đổi mật khẩu
    h(UserSettingsPasswordForm, { onChangePassword, onSuccess }),
  );
}
