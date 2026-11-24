import { h, useState, useEffect } from '../../../lib/react.js';
import { Spinner } from '../../../components/ui/index.js';
import { fetchStudentClassDetails, fetchClassAnnouncements } from '../api/studentApi.js';
import { StudentClassHeader } from './StudentClassHeader.js';
import { StudentClassInfoTab } from './StudentClassInfoTab.js';
import { StudentClassRosterTab } from './StudentClassRosterTab.js';
import { StudentClassLabsTab } from './StudentClassLabsTab.js';

export function StudentClassWorkspace({
  classId,
  onBack,
  activeLabId,
  setActiveLabId,
  labDetails,
  activeSub,
  submissionsList,
  submittingCode,
  handleCodeSubmit,
  refreshDetails,
  refreshLabs,
}) {
  const [activeTab, setActiveTab] = useState('info');
  const [classroom, setClassroom] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classRes, annRes] = await Promise.all([
        fetchStudentClassDetails(classId),
        fetchClassAnnouncements(classId),
      ]);
      if (classRes?.class) setClassroom(classRes.class);
      if (annRes?.items) setAnnouncements(annRes.items);
    } catch {
      setClassroom(null);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) loadData();
  }, [classId]);

  if (loading) {
    return h(Spinner, { center: true, size: 24, label: 'Đang tải không gian lớp học...' });
  }

  const className = classroom?.name || `Lớp #${classId}`;
  const teachers = classroom?.teachers || [];
  const teacherText =
    teachers.length > 0
      ? teachers.map((t) => t.name || `@${t.username}`).join(', ')
      : 'Chưa phân công';
  const students = classroom?.students || [];
  const studentCount = classroom?.studentCount || students.length || 0;
  const labCount = classroom?.labCount || 0;

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    h(StudentClassHeader, {
      className,
      teacherText,
      studentCount,
      labCount,
      activeTab,
      onSelectTab: setActiveTab,
      onBack,
    }),
    activeTab === 'info' && h(StudentClassInfoTab, { classroom, announcements }),
    activeTab === 'roster' && h(StudentClassRosterTab, { classroom }),
    activeTab === 'labs' &&
      h(StudentClassLabsTab, {
        classId,
        activeLabId,
        setActiveLabId,
        labDetails,
        activeSub,
        submissionsList,
        submittingCode,
        handleCodeSubmit,
        refreshDetails,
        refreshLabs,
      }),
  );
}
