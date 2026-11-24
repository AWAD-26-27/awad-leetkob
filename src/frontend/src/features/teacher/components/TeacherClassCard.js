import { h } from '../../../lib/react.js';
import { Card, Button } from '../../../components/ui/index.js';

export function TeacherClassCard({ cls, onSelectClass }) {
  return h(
    Card,
    {
      key: cls.id,
      style: {
        padding: '22px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
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
            marginBottom: '12px',
          },
        },
        h(
          'div',
          {
            style: {
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              border: '1px solid #bfdbfe',
            },
          },
          '🏫',
        ),
        h(
          'div',
          null,
          h(
            'h3',
            {
              style: {
                fontSize: '17px',
                fontWeight: '800',
                color: '#0f172a',
                margin: 0,
              },
            },
            cls.name,
          ),
          h('div', { style: { fontSize: '12.5px', color: '#64748b' } }, `Mã lớp: #${cls.id}`),
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
        h(
          'span',
          {
            style: {
              fontSize: '12px',
              fontWeight: '600',
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            },
          },
          `👥 ${cls.studentCount || 0} Sinh viên`,
        ),
        h(
          'span',
          {
            style: {
              fontSize: '12px',
              fontWeight: '600',
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
            },
          },
          `🧪 ${cls.labCount || 0} Bài Lab`,
        ),
        cls.announcementCount !== undefined &&
          h(
            'span',
            {
              style: {
                fontSize: '12px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
              },
            },
            `📢 ${cls.announcementCount} Thông báo`,
          ),
      ),
    ),
    h(
      'div',
      {
        style: {
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
          display: 'flex',
          justifyContent: 'flex-end',
        },
      },
      h(
        Button,
        {
          variant: 'primary',
          onClick: () => onSelectClass(cls.id),
          style: {
            width: '100%',
            padding: '9px 16px',
            fontWeight: '700',
            fontSize: '13.5px',
          },
        },
        'Vào lớp học →',
      ),
    ),
  );
}
