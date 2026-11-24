import { h } from '../lib/react.js';
import { Card, Button } from '../components/ui/index.js';

export function GuestLandingCard({ onOpenLogin }) {
  return h(
    Card,
    {
      style: {
        padding: '40px 32px',
        textAlign: 'center',
        maxWidth: '580px',
        margin: '40px auto',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
      },
    },
    h(
      'div',
      {
        style: {
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: '800',
          color: '#ffffff',
          margin: '0 auto 18px auto',
        },
      },
      'L',
    ),
    h(
      'h2',
      { style: { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' } },
      'Hệ thống nộp & đánh giá bài tập C++',
    ),
    h(
      'p',
      { style: { fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 24px 0' } },
      'Vui lòng đăng nhập bằng tài khoản được cấp để xem danh sách bài thực hành và nộp bài.',
    ),
    h(
      Button,
      {
        variant: 'primary',
        size: 'lg',
        onClick: onOpenLogin,
        style: { padding: '10px 28px', fontSize: '14px', fontWeight: '600' },
      },
      'Đăng nhập',
    ),
  );
}
