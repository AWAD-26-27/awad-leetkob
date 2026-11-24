import { h, useState, useEffect } from '../../../lib/react.js';
import { Spinner } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { fetchClassLabs, fetchClassSubmissions } from '../api/studentApi.js';
import { StudentLabCard } from './StudentLabCard.js';
import { StudentLabWorkspace } from './StudentLabWorkspace.js';

export function StudentClassLabsTab({
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
}) {
  const [labs, setLabs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLabId, setSelectedLabId] = useState(activeLabId || null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [labsRes, subsRes] = await Promise.all([
        fetchClassLabs(classId),
        fetchClassSubmissions(classId),
      ]);
      const items = labsRes?.items || [];
      setLabs(items);
      setSubmissions(subsRes?.items || []);
    } catch {
      setLabs([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) loadData();
  }, [classId]);

  const handleSelectLab = (labId) => {
    setSelectedLabId(labId);
    if (setActiveLabId) setActiveLabId(labId);
  };

  const handleBackToList = () => {
    setSelectedLabId(null);
    loadData();
  };

  if (loading) {
    return h(Spinner, { center: true, size: 24, label: 'Đang tải danh sách bài lab...' });
  }

  // If a lab is selected, show the workspace to do the lab
  if (selectedLabId) {
    const currentLab = labs.find((l) => l.id === selectedLabId) || { id: selectedLabId };
    return h(StudentLabWorkspace, {
      lab: currentLab,
      labDetails,
      onBackToList: handleBackToList,
      activeSub,
      submissionsList,
      submittingCode,
      handleCodeSubmit,
      refreshDetails,
      refreshLabs,
    });
  }

  // View 1: List of all labs in the class with their status
  if (labs.length === 0) {
    return h(EmptyState, {
      title: 'Chưa có bài lab nào',
      description: 'Giảng viên của lớp chưa đăng tải hoặc chưa công bố bài thực hành nào.',
    });
  }

  // Compute status metrics
  let doneCount = 0;
  let wrongCount = 0;
  let notDoneCount = 0;

  labs.forEach((lab) => {
    const labSubs = submissions.filter((s) => s.labId === lab.id);
    if (labSubs.length === 0) notDoneCount++;
    else if (labSubs.some((s) => s.judgeVerdict === 'Accepted' || s.judgeVerdict === 'AC')) doneCount++;
    else wrongCount++;
  });

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    // Summary Cards: Total, Done, Wrong, Not done
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        },
      },
      statusSummary('Tổng bài lab', `${labs.length}`, '#0f172a', '#f1f5f9'),
      statusSummary('Đã làm (Đạt)', `${doneCount}`, '#059669', '#ecfdf5'),
      statusSummary('Làm sai', `${wrongCount}`, '#dc2626', '#fef2f2'),
      statusSummary('Chưa làm', `${notDoneCount}`, '#64748b', '#f8fafc'),
    ),
    // Lab cards grid
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        },
      },
      labs.map((lab) =>
        h(StudentLabCard, {
          key: lab.id,
          lab,
          submissions,
          onSelectLab: handleSelectLab,
        }),
      ),
    ),
  );
}

function statusSummary(label, count, color, bg) {
  return h(
    'div',
    {
      style: {
        padding: '12px 14px',
        backgroundColor: bg,
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
      },
    },
    h('div', { style: { fontSize: '18px', fontWeight: '800', color } }, count),
    h('div', { style: { fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '2px' } }, label),
  );
}
