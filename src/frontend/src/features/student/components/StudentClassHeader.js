import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function StudentClassHeader({
  className,
  teacherText,
  studentCount,
  labCount,
  activeTab,
  onSelectTab,
  onBack,
}) {
  return h(
    'div',
    {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      },
    },
    // Top Row: Back button and Breadcrumbs
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        },
      },
      h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: onBack,
          style: {
            fontSize: '12.5px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#475569',
            borderColor: '#cbd5e1',
          },
        },
        '← Trở về danh sách lớp',
      ),
      h(
        'div',
        { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        h(
          'span',
          {
            style: {
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontWeight: '600',
              border: '1px solid #a7f3d0',
            },
          },
          'Đang học',
        ),
        h(
          'span',
          {
            style: {
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontWeight: '500',
              border: '1px solid #e2e8f0',
            },
          },
          'Học kỳ 1 2026-2027',
        ),
      ),
    ),
    // Main Title and Teacher subtitle
    h(
      'div',
      { style: { marginBottom: '20px' } },
      h(
        'h1',
        {
          style: {
            margin: '0 0 6px 0',
            fontSize: '22px',
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: '-0.02em',
          },
        },
        className,
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '13px',
            color: '#64748b',
            flexWrap: 'wrap',
          },
        },
        h(
          'span',
          null,
          `👨‍🏫 Giảng viên: `,
          h('strong', { style: { color: '#1e293b' } }, teacherText),
        ),
        h('span', { style: { color: '#cbd5e1' } }, '•'),
        h(
          'span',
          null,
          `👥 Sĩ số: `,
          h('strong', { style: { color: '#1e293b' } }, `${studentCount} sinh viên`),
        ),
        h('span', { style: { color: '#cbd5e1' } }, '•'),
        h(
          'span',
          null,
          `🧪 Bài thực hành: `,
          h('strong', { style: { color: '#1e293b' } }, `${labCount} bài lab`),
        ),
      ),
    ),
    // Navigation Tabs Bar (3 main pages: Thông tin lớp học, Danh sách lớp, Các bài labs)
    h(
      'div',
      {
        style: {
          display: 'flex',
          gap: '8px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
          overflowX: 'auto',
        },
        role: 'tablist',
      },
      tabButton('info', '📋 Thông tin lớp học', activeTab, onSelectTab),
      tabButton('roster', '👥 Danh sách lớp', activeTab, onSelectTab),
      tabButton('labs', '🧪 Các bài labs', activeTab, onSelectTab),
    ),
  );
}

function tabButton(key, label, activeTab, onSelect) {
  const isActive = activeTab === key;
  return h(
    'button',
    {
      type: 'button',
      role: 'tab',
      'aria-selected': isActive,
      onClick: () => onSelect(key),
      style: {
        padding: '8px 18px',
        fontSize: '13.5px',
        fontWeight: isActive ? '700' : '500',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: isActive ? '#0f172a' : '#f8fafc',
        color: isActive ? '#ffffff' : '#64748b',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
      },
    },
    label,
  );
}
