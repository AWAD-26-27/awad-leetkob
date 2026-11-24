import { h } from '../lib/react.js';

export function AdminModeBar({ adminViewMode, onSelectMode }) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
      },
    },
    h(
      'button',
      {
        type: 'button',
        onClick: () => onSelectMode('admin'),
        style: {
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: '600',
          borderRadius: '6px',
          border: '1px solid',
          borderColor: adminViewMode === 'admin' ? '#6366f1' : '#cbd5e1',
          backgroundColor: adminViewMode === 'admin' ? '#6366f1' : '#ffffff',
          color: adminViewMode === 'admin' ? '#ffffff' : '#475569',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        },
      },
      'Quản lý hệ thống (Lớp học & Người dùng)',
    ),
    h(
      'button',
      {
        type: 'button',
        onClick: () => onSelectMode('labs'),
        style: {
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: '600',
          borderRadius: '6px',
          border: '1px solid',
          borderColor: adminViewMode === 'labs' ? '#6366f1' : '#cbd5e1',
          backgroundColor: adminViewMode === 'labs' ? '#6366f1' : '#ffffff',
          color: adminViewMode === 'labs' ? '#ffffff' : '#475569',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        },
      },
      'Quản lý bài thực hành (Labs)',
    ),
  );
}
