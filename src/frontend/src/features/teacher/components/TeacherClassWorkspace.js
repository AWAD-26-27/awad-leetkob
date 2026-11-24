import { h, useState, useEffect } from '../../../lib/react.js';
import { Card, Button, Spinner } from '../../../components/ui/index.js';
import { ClassOverviewTab } from './ClassOverviewTab.js';
import { ClassAnnouncementsTab } from './ClassAnnouncementsTab.js';
import { TeacherClassRosterTab } from './TeacherClassRosterTab.js';
import { TeacherClassLabsTab } from './TeacherClassLabsTab.js';
import {
  fetchClassDetails,
  fetchClassLabs,
  fetchClassStudents,
  fetchClassAnnouncements,
  createAnnouncementApi,
} from '../api/index.js';
import { useToast } from '../../../providers/ToastProvider.js';

export function TeacherClassWorkspace({ classId, onBack, onSelectLab }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'announcements', 'roster', 'labs'
  const [classroom, setClassroom] = useState(null);
  const [labs, setLabs] = useState([]);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  const loadAll = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const [clsRes, labsRes, stuRes, annRes] = await Promise.all([
        fetchClassDetails(classId),
        fetchClassLabs(classId),
        fetchClassStudents(classId),
        fetchClassAnnouncements(classId),
      ]);
      if (clsRes?.class) setClassroom(clsRes.class);
      if (labsRes?.items) setLabs(labsRes.items);
      if (stuRes?.items) setStudents(stuRes.items);
      if (annRes?.items) setAnnouncements(annRes.items);
    } catch {
      toast.error('Không thể tải dữ liệu lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [classId]);

  const handlePostAnnouncement = async ({ title, content }) => {
    setPostingAnnouncement(true);
    try {
      const res = await createAnnouncementApi(classId, { title, content });
      toast.success('Đã đăng thông báo thành công!');
      if (res?.announcement) {
        setAnnouncements((prev) => [res.announcement, ...prev]);
      } else {
        loadAll();
      }
    } catch (err) {
      toast.error(err.detail || err.message || 'Lỗi đăng thông báo');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const tabs = [
    { key: 'overview', label: '🏢 Thông tin chung' },
    { key: 'announcements', label: '📢 Thông báo', count: announcements.length },
    { key: 'roster', label: '👥 Danh sách lớp', count: students.length },
    { key: 'labs', label: '🧪 Danh sách Lab', count: labs.length },
  ];

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    // Header Banner
    h(
      Card,
      { style: { padding: '20px 24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          },
        },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '14px' } },
          h(
            Button,
            {
              variant: 'outline',
              onClick: onBack,
              style: { fontSize: '13px', padding: '6px 12px' },
            },
            '← Danh sách lớp',
          ),
          h(
            'div',
            null,
            h(
              'h2',
              { style: { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 } },
              classroom?.name || `Lớp #${classId}`,
            ),
            h(
              'div',
              { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
              `Mã lớp: #${classId} • Giảng viên quản lý`,
            ),
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', gap: '10px' } },
          h(
            'span',
            {
              style: {
                fontSize: '13px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#ecfdf5',
                color: '#065f46',
              },
            },
            `👥 ${students.length} Sinh viên`,
          ),
          h(
            'span',
            {
              style: {
                fontSize: '13px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#eff6ff',
                color: '#1e40af',
              },
            },
            `🧪 ${labs.length} Labs`,
          ),
        ),
      ),
    ),

    // Tab Navigation Bar
    h(
      'div',
      {
        style: {
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '2px',
        },
      },
      tabs.map((tab) =>
        h(
          'button',
          {
            key: tab.key,
            onClick: () => setActiveTab(tab.key),
            style: {
              padding: '10px 18px',
              fontSize: '14px',
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

    // Active Tab Content
    loading
      ? h(Spinner, { center: true, size: 36, label: 'Đang tải dữ liệu lớp học...' })
      : activeTab === 'overview'
        ? h(ClassOverviewTab, { classroom, labs, students, announcements })
        : activeTab === 'announcements'
          ? h(ClassAnnouncementsTab, {
              announcements,
              onPostAnnouncement: handlePostAnnouncement,
              posting: postingAnnouncement,
            })
          : activeTab === 'roster'
            ? h(TeacherClassRosterTab, { students, loading })
            : activeTab === 'labs'
              ? h(TeacherClassLabsTab, {
                  classId,
                  labs,
                  onSelectLab,
                  onLabCreated: loadAll,
                  loading,
                })
              : null,
  );
}
