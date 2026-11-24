import { h, useState, useEffect } from '../../../lib/react.js';
import { Card, Spinner } from '../../../components/ui/index.js';
import { useMyClass } from '../hooks/index.js';
import { ClassStudentTable } from './ClassStudentTable.js';
import { api } from '../../../lib/apiClient.js';
import { formatTime } from '../../../utils/formatTime.js';

export function StudentClassroomBanner({ classId }) {
  const [showRoster, setShowRoster] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const { classroom, loading } = useMyClass(classId);

  useEffect(() => {
    if (classId) {
      api
        .get(`/api/classes/${classId}/announcements`)
        .then((res) => {
          if (res?.items) setAnnouncements(res.items);
        })
        .catch(() => {});
    }
  }, [classId]);

  if (!classId) return null;

  if (loading && !classroom) {
    return h(
      Card,
      {
        style: {
          marginBottom: '20px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '24px 20px',
        },
      },
      h(Spinner, { center: true, size: 20, label: 'Đang tải thông tin lớp học...' }),
    );
  }

  const className = classroom?.name || `Lớp #${classId}`;
  const teachers = classroom?.teachers || [];
  const teacherText =
    teachers.length > 0
      ? teachers.map((t) => `${t.name} (@${t.username})`).join(', ')
      : 'Chưa phân công';
  const studentCount =
    classroom?.studentCount ?? (classroom?.students ? classroom.students.length : 0);

  const btnStyle = {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '500',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    cursor: 'pointer',
  };

  return h(
    Card,
    {
      style: {
        marginBottom: '20px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px 20px',
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
          'div',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a' } },
          `Lớp học: ${className}`,
        ),
        h(
          'div',
          { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
          h('span', { style: { fontWeight: '500', color: '#334155' } }, 'Giảng viên phụ trách: '),
          teacherText,
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
        h(
          'span',
          {
            style: {
              fontSize: '12px',
              fontWeight: '500',
              padding: '4px 10px',
              borderRadius: '4px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
            },
          },
          `Sĩ số: ${studentCount} sinh viên`,
        ),
        announcements.length > 0 &&
          h(
            'button',
            {
              type: 'button',
              onClick: () => setShowAnnouncements(!showAnnouncements),
              style: btnStyle,
            },
            showAnnouncements ? 'Ẩn thông báo' : `Thông báo (${announcements.length})`,
          ),
        classroom?.students &&
          classroom.students.length > 0 &&
          h(
            'button',
            { type: 'button', onClick: () => setShowRoster(!showRoster), style: btnStyle },
            showRoster ? 'Ẩn danh sách lớp' : 'Danh sách sinh viên',
          ),
      ),
    ),
    showAnnouncements &&
      announcements.length > 0 &&
      h(
        'div',
        {
          style: {
            marginTop: '14px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          },
        },
        announcements.map((a) =>
          h(
            'div',
            {
              key: a.id,
              style: {
                padding: '10px 12px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
              },
            },
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2px',
                },
              },
              h(
                'div',
                { style: { fontWeight: '600', fontSize: '13px', color: '#0f172a' } },
                a.title,
              ),
              h('div', { style: { fontSize: '11px', color: '#64748b' } }, formatTime(a.createdAt)),
            ),
            h(
              'div',
              { style: { fontSize: '12.5px', color: '#334155', whiteSpace: 'pre-wrap' } },
              a.content,
            ),
          ),
        ),
      ),
    showRoster &&
      classroom?.students &&
      h(
        'div',
        { style: { marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' } },
        h(ClassStudentTable, {
          classStudents: classroom.students,
          onRemove: null,
        }),
      ),
  );
}
