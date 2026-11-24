import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';
import { RefreshIcon } from './AdminIcons.js';

export function AdminHeader({ onRefresh, loading }) {
  return h(
    'div',
    {
      style: {
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
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
            gap: '8px',
          },
        },
        h(
          'h1',
          {
            style: {
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a',
              letterSpacing: '-0.02em',
            },
          },
          'Quản trị hệ thống',
        ),
        h(
          'span',
          {
            style: {
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
            },
          },
          'Admin',
        ),
      ),
      h(
        'p',
        {
          style: {
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: '#64748b',
          },
        },
        'Quản lý phân công lớp học, giảng viên phụ trách và danh bạ tài khoản người dùng.',
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
      h(
        Button,
        {
          variant: 'secondary',
          size: 'sm',
          onClick: onRefresh,
          disabled: loading,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#334155',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
          },
        },
        h(RefreshIcon, {
          size: 13,
          style: { animation: loading ? 'spin 1s linear infinite' : 'none' },
        }),
        loading ? 'Đang tải...' : 'Làm mới',
      ),
    ),
  );
}
