import { h } from '../lib/react.js';
import { Button } from '../components/ui/index.js';

export function LandingHero({ onOpenLogin }) {
  return h(
    'div',
    {
      style: {
        textAlign: 'center',
        padding: '48px 20px 36px 20px',
        maxWidth: '860px',
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
          padding: '6px 16px',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#475569',
          fontSize: '13.5px',
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
          fontSize: '38px',
          fontWeight: '800',
          lineHeight: '1.25',
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
          fontSize: '16px',
          color: '#64748b',
          lineHeight: 1.7,
          maxWidth: '720px',
          margin: '0 auto 32px auto',
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
            padding: '13px 30px',
            fontSize: '16px',
            fontWeight: '600',
          },
        },
        'Đăng nhập vào hệ thống',
      ),
    ),
  );
}
