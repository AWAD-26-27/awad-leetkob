import { h, useState, useEffect } from '../../../lib/react.js';
import { Card, Button, Spinner } from '../../../components/ui/index.js';
import { ReviewQueueTable } from '../../reviews/components/ReviewQueueTable.js';
import { fetchMyClasses } from '../api/index.js';
import { publishLab } from '../../labs/api/index.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { TeacherClassCard } from './TeacherClassCard.js';
import { TeacherDashboardHeader } from './TeacherDashboardHeader.js';

export function TeacherDashboard({
  onSelectClass,
  queue = [],
  activeLabId,
  onReview,
  setE2eStatusText,
  onPublished,
}) {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await fetchMyClasses();
      if (res?.items) setClasses(res.items);
    } catch {
      toast.error('Không thể tải danh sách lớp học của giảng viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handlePublish = async () => {
    const targetLabId = activeLabId || 1;
    setPublishing(true);
    try {
      const res = await publishLab(targetLabId);
      toast.success('Đã công bố điểm cho toàn thể sinh viên!');
      if (setE2eStatusText) setE2eStatusText(`Published at ${res.publishedAt}`);
      if (onPublished) onPublished();
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể công bố điểm');
    } finally {
      setPublishing(false);
    }
  };

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalLabs = classes.reduce((sum, c) => sum + (c.labCount || 0), 0);

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
    // Header Banner
    h(TeacherDashboardHeader, { classCount: classes.length, totalStudents, totalLabs }),

    // Classes List Grid
    loading
      ? h(Spinner, { center: true, size: 36, label: 'Đang tải danh sách lớp học phụ trách...' })
      : classes.length === 0
        ? h(
            Card,
            {
              style: {
                padding: '48px',
                textAlign: 'center',
                color: '#64748b',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
              },
            },
            h('div', { style: { fontSize: '42px', marginBottom: '12px' } }, '🏫'),
            h(
              'h3',
              {
                style: { fontSize: '17px', fontWeight: '700', color: '#334155', margin: '0 0 6px' },
              },
              'Chưa Được Phân Công Lớp Học',
            ),
            h(
              'p',
              {
                style: {
                  fontSize: '14px',
                  color: '#64748b',
                  maxWidth: '480px',
                  margin: '0 auto 16px',
                  lineHeight: '1.5',
                },
              },
              'Tài khoản Giảng viên của bạn hiện chưa được Quản trị viên (Admin) phân công phụ trách lớp học nào.',
            ),
          )
        : h(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
              },
            },
            classes.map((cls) => h(TeacherClassCard, { key: cls.id, cls, onSelectClass })),
          ),

    // Review Queue & Publish Action on Dashboard (for CI and fast TA workflow)
    (queue?.length > 0 || activeLabId) &&
      h(
        Card,
        {
          style: {
            padding: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            marginTop: '8px',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            },
          },
          h(
            'div',
            null,
            h(
              'h3',
              { style: { fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 } },
              '🔍 Hàng Đợi Xét Duyệt Bài Nộp (Review Queue)',
            ),
            h(
              'div',
              { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
              'Xét duyệt các vi phạm quy tắc kỹ thuật trước khi chính thức công bố điểm.',
            ),
          ),
          h(
            Button,
            {
              id: 'publish',
              'aria-label': 'Publish grades',
              variant: 'primary',
              onClick: handlePublish,
              disabled: publishing,
              style: { fontWeight: '700', padding: '8px 20px' },
            },
            publishing ? 'Đang công bố...' : 'Publish grades',
          ),
        ),
        h(ReviewQueueTable, {
          queue,
          onReview: async (subId, code, decision) => {
            if (onReview) await onReview(subId, code, decision);
            if (setE2eStatusText) setE2eStatusText(`Reviewed submission ${subId}`);
            loadClasses();
          },
          setE2eStatusText,
        }),
      ),
  );
}
