import { h, useState, useEffect } from '../../../lib/react.js';
import { LabClassGradesTable } from './LabClassGradesTable.js';
import { LabStatementAndRules } from './LabStatementAndRules.js';
import { TeacherLabEditCard } from './TeacherLabEditCard.js';
import { TeacherLabDetailHeader } from './TeacherLabDetailHeader.js';
import { ReviewQueueTable } from '../../reviews/components/ReviewQueueTable.js';
import { fetchLabGrades } from '../api/index.js';
import { publishLab, updateLab } from '../../labs/api/index.js';
import { useToast } from '../../../providers/ToastProvider.js';

export function TeacherLabDetailPage({
  labId,
  classroom,
  labDetails,
  queue = [],
  onBack,
  onReview,
  onLabUpdated,
  setE2eStatusText,
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('grades'); // 'grades', 'statement', 'queue'
  const [gradesData, setGradesData] = useState(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStatement, setEditStatement] = useState('');

  // Automatically switch to queue tab when pending items need review
  useEffect(() => {
    if (
      queue?.some(
        (q) => !q.decision && q.reviewStatus !== 'confirmed' && q.reviewStatus !== 'overturned',
      )
    ) {
      setActiveTab('queue');
    }
  }, [queue]);

  const loadGrades = async () => {
    if (!labId) return;
    setLoadingGrades(true);
    try {
      const res = await fetchLabGrades(labId);
      setGradesData(res);
    } catch {
      toast.error('Không thể tải bảng điểm của lớp');
    } finally {
      setLoadingGrades(false);
    }
  };

  useEffect(() => {
    loadGrades();
    if (labDetails) {
      setEditTitle(labDetails.title || '');
      setEditStatement(labDetails.statement || '');
    }
  }, [labId, labDetails?.id]);

  const handlePublish = async () => {
    if (!labId) return;
    setPublishing(true);
    try {
      const res = await publishLab(labId);
      toast.success('Đã công bố điểm cho toàn thể sinh viên!');
      if (setE2eStatusText) setE2eStatusText(`Published at ${res.publishedAt}`);
      if (onLabUpdated) onLabUpdated();
      loadGrades();
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể công bố điểm (còn bài nộp chờ duyệt)');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editStatement.trim()) return;
    try {
      await updateLab(labId, { title: editTitle.trim(), statement: editStatement.trim() });
      toast.success('Đã cập nhật bài thực hành thành công!');
      setIsEditing(false);
      if (onLabUpdated) onLabUpdated();
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể cập nhật bài lab');
    }
  };

  const isPublished = Boolean(labDetails?.publishedAt || gradesData?.publishedAt);

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    h(TeacherLabDetailHeader, {
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
      studentCount: gradesData?.students?.length,
      queueCount: queue?.length,
    }),

    // Edit lab inline form
    isEditing &&
      h(TeacherLabEditCard, {
        editTitle,
        setEditTitle,
        editStatement,
        setEditStatement,
        onCancel: () => setIsEditing(false),
        onSave: handleSaveEdit,
      }),

    // Tab Contents
    activeTab === 'grades' &&
      h(LabClassGradesTable, { students: gradesData?.students || [], loading: loadingGrades }),

    activeTab === 'statement' && h(LabStatementAndRules, { lab: labDetails }),

    activeTab === 'queue' &&
      h(ReviewQueueTable, {
        queue,
        onReview: async (subId, code, decision) => {
          if (onReview) await onReview(subId, code, decision);
          loadGrades();
        },
        setE2eStatusText,
      }),
  );
}
