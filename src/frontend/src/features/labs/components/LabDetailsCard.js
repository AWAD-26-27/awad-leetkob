import { h, useState } from '../../../lib/react.js';
import { Card, Button, Badge } from '../../../components/ui/index.js';
import { Callout } from '../../../components/feedback/index.js';
import { publishLab } from '../api/labsApi.js';
import { useAuth } from '../../../providers/AuthProvider.js';
import { useToast } from '../../../providers/ToastProvider.js';

export function LabDetailsCard({ lab, onPublished, setE2eStatusText }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('statement'); // 'statement' | 'constraints' | 'tests'

  if (!lab) {
    return h(
      Callout,
      { type: 'info', title: 'Chưa chọn Lab' },
      'Vui lòng chọn bài Lab từ danh sách để xem chi tiết.',
    );
  }

  const isStaff = user.role === 'ta' || user.role === 'admin';
  const isPublished = Boolean(lab.publishedAt || lab.published_at);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await publishLab(lab.id);
      const pubTime = res.publishedAt || new Date().toISOString();
      const msg = `Published at ${pubTime}`;
      toast.success(msg);
      if (setE2eStatusText) {
        setE2eStatusText(msg);
      }
      if (onPublished) onPublished();
    } catch (err) {
      const errMsg = err.title || err.detail || err.message || 'Failed to publish grades';
      toast.error(errMsg);
      if (setE2eStatusText) {
        setE2eStatusText(errMsg);
      }
    } finally {
      setPublishing(false);
    }
  };

  return h(
    Card,
    {
      title: `Lab ${lab.id}: ${lab.title || 'Assignment'}`,
      style: { marginBottom: '24px' },
      headerRight: isPublished
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
    },
    // Navigation Sub-tabs
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
            transition: 'all 0.15s ease',
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
            transition: 'all 0.15s ease',
          },
        },
        `⚡ Ràng buộc kỹ thuật (${lab.constraints ? lab.constraints.length : 0})`,
      ),
      lab.tests &&
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
              transition: 'all 0.15s ease',
            },
          },
          `🧪 Test cases (${lab.tests.length})`,
        ),
    ),

    // Tab 1: Problem Statement
    activeTab === 'statement' &&
      h(
        'div',
        { className: 'animate-fade-in', style: { marginBottom: '16px' } },
        h(
          'div',
          {
            style: {
              padding: '16px 20px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '14px',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              color: '#1e293b',
            },
          },
          lab.statement || lab.statementMd || lab.statement_md || 'Không có mô tả chi tiết.',
        ),
      ),

    // Tab 2: Constraints
    activeTab === 'constraints' &&
      h(
        'div',
        { className: 'animate-fade-in', style: { marginBottom: '16px' } },
        lab.constraints && lab.constraints.length > 0
          ? h(
              'div',
              { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
              lab.constraints.map((c) =>
                h(
                  'div',
                  {
                    key: c.code,
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--color-bg)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px',
                    },
                  },
                  h(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    h(
                      Badge,
                      {
                        variant: 'info',
                        style: { fontFamily: 'var(--font-mono)', fontWeight: '700' },
                      },
                      c.code,
                    ),
                    h('span', { style: { fontWeight: '500', color: '#1e293b' } }, c.text),
                  ),
                  h(
                    Badge,
                    {
                      variant: 'danger',
                      style: { fontWeight: '700', padding: '3px 8px' },
                    },
                    `-${c.deduction} pts`,
                  ),
                ),
              ),
            )
          : h(
              'div',
              { style: { color: '#64748b', fontSize: '13px' } },
              'Không có ràng buộc kỹ thuật nào.',
            ),
      ),

    // Tab 3: Sample Test Cases
    activeTab === 'tests' &&
      lab.tests &&
      h(
        'div',
        { className: 'animate-fade-in', style: { marginBottom: '16px' } },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          lab.tests.map((t, idx) =>
            h(
              'div',
              {
                key: idx,
                style: {
                  padding: '12px 14px',
                  backgroundColor: '#0b0f19',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: '#e2e8f0',
                },
              },
              h(
                'div',
                { style: { color: '#94a3b8', marginBottom: '4px' } },
                `Test Case #${t.ordinal || idx + 1}:`,
              ),
              h('div', null, `Input: ${t.input || t.inputText || '—'}`),
              h(
                'div',
                { style: { color: '#10b981', marginTop: '2px' } },
                `Expected: ${t.expected || t.expectedOutput || '—'}`,
              ),
            ),
          ),
        ),
      ),

    // Staff Publish Action (matches Playwright getByRole('button', { name: 'Publish grades' }) and #publish)
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
