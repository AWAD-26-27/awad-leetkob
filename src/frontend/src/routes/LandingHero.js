import { h } from '../lib/react.js';
import { Button } from '../components/ui/index.js';

export function LandingHero({ onOpenLogin }) {
  return h(
    'div',
    {
      style: {
        textAlign: 'center',
        padding: '40px 20px 32px 20px',
        maxWidth: '780px',
        margin: '0 auto',
      },
    },
    // Top Course Badge
    h(
      'div',
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          borderRadius: '6px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#475569',
          fontSize: '12px',
          fontWeight: '600',
          marginBottom: '20px',
        },
      },
      'Hệ thống nộp & đánh giá bài tập C++',
    ),

    // Main Hero Headline
    h(
      'h1',
      {
        style: {
          fontSize: '32px',
          fontWeight: '800',
          lineHeight: '1.3',
          letterSpacing: '-0.025em',
          color: '#0f172a',
          margin: '0 0 16px 0',
        },
      },
      'Nền Tảng Hỗ Trợ Thực Hành & Đánh Giá Bài Tập C++',
    ),

    // Subtitle Description
    h(
      'p',
      {
        style: {
          fontSize: '14.5px',
          color: '#64748b',
          lineHeight: 1.65,
          maxWidth: '640px',
          margin: '0 auto 28px auto',
        },
      },
      'Môi trường hỗ trợ sinh viên nộp bài thực hành, kiểm tra tự động giới hạn tài nguyên và cấu trúc mã nguồn; đồng thời giúp giảng viên và trợ giảng quản lý xét duyệt bài nộp trước khi công bố kết quả.',
    ),

    // Action CTA Button
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        },
      },
      h(
        Button,
        {
          variant: 'primary',
          size: 'lg',
          onClick: onOpenLogin,
          style: {
            padding: '11px 26px',
            fontSize: '14.5px',
            fontWeight: '600',
          },
        },
        'Đăng nhập vào hệ thống',
      ),
    ),
  );
}
