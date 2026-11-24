import { h, useState, useEffect } from '../../../lib/react.js';
import { Card, Button, Badge } from '../../../components/ui/index.js';
import { Callout } from '../../../components/feedback/index.js';
import { publishLab, updateLab } from '../api/index.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { LabStatementView } from './LabStatementView.js';
import { LabConstraintsView } from './LabConstraintsView.js';
import { LabTestCasesView } from './LabTestCasesView.js';

export function LabDetailsCard({ lab, onPublished, onLabUpdated, setE2eStatusText }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('statement');

  // Inline editing state for assigned teacher
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStatement, setEditStatement] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (lab) {
      setEditTitle(lab.title || '');
      setEditStatement(lab.statement || '');
      setIsEditing(false);
    }
  }, [lab?.id]);

  if (!lab) {
    return h(
      Callout,
      { type: 'info', title: 'Chưa chọn Lab' },
      'Vui lòng chọn bài Lab từ danh sách để xem chi tiết.',
    );
  }

  const isStaff = user.role === 'ta' || user.role === 'admin';
  const isAssignedTeacher = user.role === 'ta' && Number(user.classId) === Number(lab.classId);
  const isPublished = Boolean(lab.publishedAt || lab.published_at);

  const handleSaveEdit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!editTitle.trim()) {
      toast.error('Tiêu đề không được để trống');
      return;
    }
    setSavingEdit(true);
    try {
      await updateLab(lab.id, {
        title: editTitle.trim(),
        statement: editStatement.trim(),
      });
      toast.success('Đã cập nhật bài thực hành thành công!');
      setIsEditing(false);
      if (onLabUpdated) onLabUpdated();
    } catch (err) {
      toast.error(err.detail || err.message || 'Lỗi khi cập nhật bài lab');
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await publishLab(lab.id);
      const pubTime = res.publishedAt || new Date().toISOString();
      const msg = `Published at ${pubTime}`;
      toast.success(msg);
      if (setE2eStatusText) setE2eStatusText(msg);
      if (onPublished) onPublished();
    } catch (err) {
      const errMsg = err.title || err.detail || err.message || 'Failed to publish grades';
      toast.error(errMsg);
      if (setE2eStatusText) setE2eStatusText(errMsg);
    } finally {
      setPublishing(false);
    }
  };

  return h(
    Card,
    {
      title: `Lab ${lab.id}: ${lab.title || 'Assignment'}`,
      style: { marginBottom: '24px' },
      headerRight: h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
        isAssignedTeacher &&
          h(
            Button,
            {
              size: 'sm',
              variant: isEditing ? 'secondary' : 'outline',
              onClick: () => {
                setEditTitle(lab.title || '');
                setEditStatement(lab.statement || '');
                setIsEditing(!isEditing);
              },
              style: {
                fontSize: '12px',
                padding: '4px 10px',
                fontWeight: '600',
              },
            },
            isEditing ? '✕ Hủy sửa' : '✏️ Sửa bài lab',
          ),
        isPublished
          ? h(
              Badge,
              {
                variant: 'success',
                style: { padding: '4px 12px', fontSize: '12px', fontWeight: '700' },
              },
              '✓ Đã công bố điểm (Published)',
            )
          : h(
              Badge,
              {
                variant: 'warning',
                style: { padding: '4px 12px', fontSize: '12px', fontWeight: '700' },
              },
              '⏳ Đang chấm & Xét duyệt',
            ),
      ),
    },
    isEditing &&
      h(
        'form',
        {
          onSubmit: handleSaveEdit,
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '16px',
          },
        },
        h(
          'div',
          { style: { fontWeight: '700', fontSize: '14px', color: '#0f172a' } },
          '✏️ Chỉnh Sửa Bài Thực Hành (Chỉ Giảng Viên Phụ Trách Lớp)',
        ),
        h(
          'label',
          { style: { fontSize: '12px', fontWeight: '600', color: '#475569' } },
          'Tiêu đề bài lab:',
        ),
        h('input', {
          type: 'text',
          value: editTitle,
          onChange: (e) => setEditTitle(e.target.value),
          style: {
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            width: '100%',
            boxSizing: 'border-box',
          },
          placeholder: 'Nhập tiêu đề bài lab...',
        }),
        h(
          'label',
          { style: { fontSize: '12px', fontWeight: '600', color: '#475569' } },
          'Nội dung đề bài (Markdown):',
        ),
        h('textarea', {
          rows: 6,
          value: editStatement,
          onChange: (e) => setEditStatement(e.target.value),
          style: {
            padding: '8px 12px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            width: '100%',
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          },
          placeholder: 'Nhập nội dung đề bài Markdown...',
        }),
        h(
          'div',
          { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' } },
          h(
            Button,
            {
              type: 'button',
              variant: 'secondary',
              size: 'sm',
              onClick: () => setIsEditing(false),
            },
            'Hủy',
          ),
          h(
            Button,
            { type: 'submit', variant: 'primary', size: 'sm', loading: savingEdit },
            '💾 Lưu thay đổi',
          ),
        ),
      ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '12px',
          marginBottom: '16px',
        },
      },
      h(
        'button',
        {
          type: 'button',
          onClick: () => setActiveTab('statement'),
          style: {
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: activeTab === 'statement' ? '700' : '500',
            backgroundColor: activeTab === 'statement' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: activeTab === 'statement' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
          },
        },
        '📖 Đề bài & Yêu cầu',
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: () => setActiveTab('constraints'),
          style: {
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: activeTab === 'constraints' ? '700' : '500',
            backgroundColor:
              activeTab === 'constraints' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: activeTab === 'constraints' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
          },
        },
        `⚡ Ràng buộc bài tập (${lab.constraints ? lab.constraints.length : 0})`,
      ),
      (lab.tests || lab.testCases) &&
        h(
          'button',
          {
            type: 'button',
            onClick: () => setActiveTab('tests'),
            style: {
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'tests' ? '700' : '500',
              backgroundColor: activeTab === 'tests' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: activeTab === 'tests' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
            },
          },
          `🧪 Test cases (${(lab.tests || lab.testCases || []).length})`,
        ),
    ),
    activeTab === 'statement' && h(LabStatementView, { lab }),
    activeTab === 'constraints' && h(LabConstraintsView, { constraints: lab.constraints }),
    activeTab === 'tests' && h(LabTestCasesView, { tests: lab.tests || lab.testCases }),
    isStaff &&
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)',
            marginTop: '8px',
          },
        },
        h(
          'div',
          { style: { fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '500px' } },
          isPublished
            ? '✓ Điểm số của bài Lab này đã được công bố chính thức cho sinh viên.'
            : '⚠️ Sau khi duyệt xong tất cả các vi phạm trong hàng đợi, hãy bấm Công bố điểm để sinh viên xem kết quả.',
        ),
        h(
          Button,
          {
            id: 'publish',
            variant: isPublished ? 'secondary' : 'primary',
            size: 'md',
            onClick: handlePublish,
            loading: publishing,
            style: {
              fontWeight: '700',
              padding: '8px 22px',
              boxShadow: isPublished ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.35)',
            },
          },
          'Publish grades',
        ),
      ),
  );
}
