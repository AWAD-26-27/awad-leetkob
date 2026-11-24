import { h } from '../../../lib/react.js';
import { Card, Button } from '../../../components/ui/index.js';

export function StudentClassCard({ cls, onSelectClass }) {
  const teachers = cls.teachers || [];
  const teacherText =
    teachers.length > 0
      ? teachers.map((t) => t.name || `@${t.username}`).join(', ')
      : 'Chưa phân công';

  return h(
    Card,
    {
      key: cls.id,
      style: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
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
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px',
          },
        },
        h(
          'div',
          null,
          h(
            'h3',
            {
              style: {
                margin: 0,
                fontSize: '16px',
                fontWeight: '700',
                color: '#0f172a',
              },
            },
            cls.name,
          ),
          h(
            'span',
            {
              style: {
                fontSize: '12px',
                color: '#64748b',
                fontFamily: 'monospace',
              },
            },
            `Mã lớp: #${cls.id}`,
          ),
        ),
      ),
      h(
        'div',
        {
          style: {
            fontSize: '13px',
            color: '#334155',
            marginBottom: '14px',
            lineHeight: '1.5',
          },
        },
        h('strong', { style: { color: '#475569' } }, 'Giảng viên: '),
        teacherText,
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          },
        },
        h(
          'span',
          { style: badgeStyle('#f8fafc', '#475569', '#e2e8f0') },
          `Sĩ số: ${cls.studentCount || 0}`,
        ),
        h(
          'span',
          { style: badgeStyle('#eff6ff', '#1d4ed8', '#bfdbfe') },
          `Bài Lab: ${cls.labCount || 0}`,
        ),
        cls.announcementCount > 0 &&
          h(
            'span',
            { style: badgeStyle('#fefce8', '#854d0e', '#fef08a') },
            `Thông báo: ${cls.announcementCount}`,
          ),
      ),
    ),
    h(
      Button,
      {
        variant: 'primary',
        onClick: () => onSelectClass && onSelectClass(cls.id),
        style: {
          width: '100%',
          padding: '8px 14px',
          fontWeight: '600',
          fontSize: '13px',
        },
      },
      'Vào lớp học',
    ),
  );
}

function badgeStyle(bg, color, border) {
  return {
    fontSize: '12px',
    fontWeight: '500',
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: bg,
    color: color,
    border: `1px solid ${border}`,
  };
}
