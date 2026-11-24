import { h } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';

export function TeacherDashboardHeader({ classCount = 0, totalStudents = 0, totalLabs = 0 }) {
  return h(
    Card,
    {
      style: {
        padding: '24px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        },
      },
      h(
        'div',
        null,
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          h('span', { style: { fontSize: '24px' } }, '👨‍🏫'),
          h(
            'h2',
            { style: { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 } },
            'Lớp Học Phụ Trách',
          ),
        ),
        h(
          'div',
          { style: { fontSize: '13.5px', color: '#64748b', marginTop: '4px' } },
          'Chọn một lớp học để quản lý đề bài, đăng thông báo, kiểm tra bảng điểm và xét duyệt bài nộp.',
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', gap: '12px' } },
        h(
          'div',
          {
            style: {
              textAlign: 'center',
              padding: '8px 16px',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
            },
          },
          h(
            'div',
            { style: { fontSize: '11px', fontWeight: '700', color: '#1e40af' } },
            'TỔNG SỐ LỚP',
          ),
          h(
            'div',
            { style: { fontSize: '18px', fontWeight: '800', color: '#1d4ed8' } },
            classCount,
          ),
        ),
        h(
          'div',
          {
            style: {
              textAlign: 'center',
              padding: '8px 16px',
              background: '#ecfdf5',
              borderRadius: '8px',
              border: '1px solid #a7f3d0',
            },
          },
          h(
            'div',
            { style: { fontSize: '11px', fontWeight: '700', color: '#065f46' } },
            'TỔNG SINH VIÊN',
          ),
          h(
            'div',
            { style: { fontSize: '18px', fontWeight: '800', color: '#059669' } },
            totalStudents,
          ),
        ),
        h(
          'div',
          {
            style: {
              textAlign: 'center',
              padding: '8px 16px',
              background: '#fffbeb',
              borderRadius: '8px',
              border: '1px solid #fde68a',
            },
          },
          h(
            'div',
            { style: { fontSize: '11px', fontWeight: '700', color: '#92400e' } },
            'TỔNG SỐ LABS',
          ),
          h('div', { style: { fontSize: '18px', fontWeight: '800', color: '#d97706' } }, totalLabs),
        ),
      ),
    ),
  );
}
