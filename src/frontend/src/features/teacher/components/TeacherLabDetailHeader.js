import { h } from '../../../lib/react.js';
import { Card, Button, Badge } from '../../../components/ui/index.js';

export function TeacherLabDetailHeader({
  labId,
  classroom,
  labDetails,
  isPublished,
  isEditing,
  setIsEditing,
  publishing,
  handlePublish,
  onBack,
  activeTab,
  setActiveTab,
  studentCount,
  queueCount,
}) {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    // Header & Navigation Bar
    h(
      Card,
      { style: { padding: '16px 20px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          },
        },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          h(
            Button,
            {
              variant: 'outline',
              onClick: onBack,
              style: { padding: '6px 12px', fontSize: '13px' },
            },
            `← Lớp: ${classroom?.name || 'Lớp học'}`,
          ),
          h(
            'div',
            null,
            h(
              'h2',
              { style: { fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 } },
              labDetails?.title || `Lab #${labId}`,
            ),
            h(
              'div',
              { style: { fontSize: '12.5px', color: '#64748b', marginTop: '2px' } },
              `Mã bài: #${labId} • ${classroom?.name || 'Classroom'}`,
            ),
          ),
          h(
            Badge,
            { variant: isPublished ? 'success' : 'warning' },
            isPublished ? '✓ Đã công bố' : 'Bản nháp',
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          h(
            Button,
            {
              variant: 'outline',
              onClick: () => setIsEditing((prev) => !prev),
              style: { fontSize: '13px', padding: '7px 14px' },
            },
            isEditing ? '✕ Hủy sửa' : '✏️ Sửa đề bài',
          ),
          !isPublished &&
            h(
              Button,
              {
                id: 'publish',
                'aria-label': 'Publish grades',
                variant: 'primary',
                onClick: handlePublish,
                disabled: publishing,
                style: { fontSize: '13px', padding: '7px 16px', fontWeight: '700' },
              },
              publishing ? 'Đang công bố...' : 'Publish grades',
            ),
        ),
      ),
    ),

    // Tabs Header
    h(
      'div',
      {
        style: {
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '2px',
        },
      },
      [
        { key: 'grades', label: '📊 Bảng điểm lớp học', count: studentCount },
        { key: 'statement', label: '📖 Đề bài & Ràng buộc' },
        { key: 'queue', label: '🔍 Hàng đợi xét duyệt', count: queueCount },
      ].map((tab) =>
        h(
          'button',
          {
            key: tab.key,
            onClick: () => setActiveTab(tab.key),
            style: {
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: activeTab === tab.key ? '700' : '500',
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            },
          },
          tab.label,
          tab.count !== undefined &&
            h(
              'span',
              {
                style: {
                  fontSize: '11.5px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: activeTab === tab.key ? '#eff6ff' : '#f1f5f9',
                  color: activeTab === tab.key ? '#2563eb' : '#64748b',
                },
              },
              tab.count,
            ),
        ),
      ),
    ),
  );
}
