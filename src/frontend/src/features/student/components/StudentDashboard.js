import { h, useState, useEffect } from '../../../lib/react.js';
import { Card, Spinner } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { fetchStudentClasses } from '../api/studentApi.js';
import { StudentClassCard } from './StudentClassCard.js';

export function StudentDashboard({ onSelectClass }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await fetchStudentClasses();
      if (res?.items) setClasses(res.items);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    h(
      Card,
      {
        style: {
          padding: '20px 24px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
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
            gap: '12px',
          },
        },
        h(
          'div',
          null,
          h(
            'h2',
            { style: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' } },
            'Lớp học của tôi',
          ),
          h(
            'p',
            { style: { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' } },
            'Danh sách các lớp học bạn đang theo học trong học kỳ này.',
          ),
        ),
        h(
          'span',
          {
            style: {
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: '600',
              fontSize: '12.5px',
              border: '1px solid #e2e8f0',
            },
          },
          `Tổng số: ${classes.length} lớp`,
        ),
      ),
    ),
    loading
      ? h(Spinner, { center: true, size: 24, label: 'Đang tải danh sách lớp học...' })
      : classes.length === 0
        ? h(EmptyState, {
            title: 'Chưa tham gia lớp học nào',
            description:
              'Tài khoản của bạn chưa được ghi danh vào lớp học nào. Vui lòng liên hệ Giảng viên hoặc Quản trị viên để được hỗ trợ.',
          })
        : h(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              },
            },
            classes.map((cls) =>
              h(StudentClassCard, {
                key: cls.id,
                cls,
                onSelectClass,
              }),
            ),
          ),
  );
}
