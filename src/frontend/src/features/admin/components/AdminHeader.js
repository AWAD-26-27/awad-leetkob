import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function AdminHeader({ onRefresh, loading }) {
  return h(
    'div',
    {
      style: {
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      },
    },
    h(
      'div',
      null,
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '800',
            fontSize: '22px',
            letterSpacing: '-0.02em',
          },
        },
        '👑 Trung Tâm Quản Trị Hệ Thống (Admin Portal)',
        h(
          'span',
          {
            style: {
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#8b5cf6',
              color: '#ffffff',
              fontWeight: '700',
            },
          },
          'ADMIN ONLY',
        ),
      ),
      h(
        'p',
        {
          style: {
            margin: '6px 0 0 0',
            fontSize: '13px',
            color: '#94a3b8',
            maxWidth: '650px',
          },
        },
        'Quản lý cấp phát tài khoản Giảng viên và Sinh viên, thành lập Lớp học và phân công Giảng viên phụ trách lớp.',
      ),
    ),
    h(
      Button,
      {
        variant: 'secondary',
        onClick: onRefresh,
        disabled: loading,
        style: { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: 'none' },
      },
      loading ? 'Đang tải...' : '🔄 Làm mới dữ liệu',
    ),
  );
}
