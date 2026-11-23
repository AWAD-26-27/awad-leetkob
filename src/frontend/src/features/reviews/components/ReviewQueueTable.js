import { h, useState } from '../../../lib/react.js';
import { Card, Badge, Button } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { useToast } from '../../../providers/ToastProvider.js';

export function ReviewQueueTable({ queue = [], onReview, setE2eStatusText }) {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (item, decision) => {
    const actionKey = `${item.id}-${item.constraintCode || 'legacy'}-${decision}`;
    setProcessingId(actionKey);
    try {
      if (onReview) {
        await onReview(item.id, item.constraintCode, decision);
      }
      const reviewedMsg = `Reviewed submission ${item.id}`;
      toast.success(reviewedMsg);
      if (setE2eStatusText) {
        setE2eStatusText(reviewedMsg);
      }
    } catch (err) {
      const errMsg = err.detail || err.message || 'Review action failed';
      toast.error(errMsg);
      if (setE2eStatusText) {
        setE2eStatusText(errMsg);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = queue.filter(
    (i) => !i.decision && i.reviewStatus !== 'confirmed' && i.reviewStatus !== 'overturned',
  ).length;
  const violationsCount = queue.filter((i) => i.verdict === 'violation').length;
  const reviewedCount = queue.length - pendingCount;

  if (queue.length === 0) {
    return h(
      Card,
      { title: 'TA Constraint Review Queue' },
      h(EmptyState, {
        title: 'Queue is empty',
        description: 'All pending submissions and constraints for this lab have been reviewed.',
      }),
    );
  }

  return h(
    Card,
    { title: 'Hàng Đợi Xét Duyệt Ràng Buộc (TA Review Queue)' },
    // Bento Grid Metrics Header
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '18px',
        },
      },
      h(
        'div',
        {
          style: {
            padding: '12px 14px',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 'var(--radius-md)',
          },
        },
        h(
          'div',
          { style: { fontSize: '11px', color: '#64748b', fontWeight: '600' } },
          '📋 TỔNG SỐ BÀI',
        ),
        h(
          'div',
          { style: { fontSize: '20px', fontWeight: '800', color: '#1e40af', marginTop: '2px' } },
          queue.length,
        ),
      ),
      h(
        'div',
        {
          style: {
            padding: '12px 14px',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
          },
        },
        h(
          'div',
          { style: { fontSize: '11px', color: '#92400e', fontWeight: '600' } },
          '⏳ CHỜ DUYỆT',
        ),
        h(
          'div',
          { style: { fontSize: '20px', fontWeight: '800', color: '#d97706', marginTop: '2px' } },
          pendingCount,
        ),
      ),
      h(
        'div',
        {
          style: {
            padding: '12px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
          },
        },
        h(
          'div',
          { style: { fontSize: '11px', color: '#991b1b', fontWeight: '600' } },
          '⚠️ VI PHẠM PHÁT HIỆN',
        ),
        h(
          'div',
          { style: { fontSize: '20px', fontWeight: '800', color: '#dc2626', marginTop: '2px' } },
          violationsCount,
        ),
      ),
      h(
        'div',
        {
          style: {
            padding: '12px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
          },
        },
        h(
          'div',
          { style: { fontSize: '11px', color: '#065f46', fontWeight: '600' } },
          '✅ ĐÃ DUYỆT',
        ),
        h(
          'div',
          { style: { fontSize: '20px', fontWeight: '800', color: '#059669', marginTop: '2px' } },
          reviewedCount,
        ),
      ),
    ),

    // Queue Items List
    h(
      'ul',
      {
        id: 'queue',
        style: {
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        },
      },
      queue.map((item) => {
        const studentName = item.student || `Student ${item.studentId || ''}`;
        const hasReviewed = Boolean(
          item.decision || item.reviewStatus === 'confirmed' || item.reviewStatus === 'overturned',
        );
        const confirmBtnName = `Confirm ${studentName}`;
        const isConfirming =
          processingId === `${item.id}-${item.constraintCode || 'legacy'}-confirm`;
        const isOverturning =
          processingId === `${item.id}-${item.constraintCode || 'legacy'}-overturn`;

        return h(
          'li',
          {
            key: `${item.id}-${item.constraintCode || item.verdict}`,
            className: 'animate-fade-in',
            style: {
              padding: '16px 18px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)',
            },
          },
          // Header info row
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              },
            },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              h(
                'span',
                { style: { fontWeight: '800', fontSize: '14.5px', letterSpacing: '-0.01em' } },
                `${studentName}: ${item.verdict || 'PENDING'}`,
              ),
              item.constraintCode && h(Badge, { variant: 'info' }, `Rule ${item.constraintCode}`),
              item.deduction > 0 && h(Badge, { variant: 'danger' }, `-${item.deduction} pts`),
            ),
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              hasReviewed
                ? h(
                    Badge,
                    {
                      variant:
                        item.decision === 'confirm' || item.reviewStatus === 'confirmed'
                          ? 'success'
                          : 'warning',
                      style: { fontWeight: '700', padding: '4px 10px' },
                    },
                    `Decision: ${(item.decision || item.reviewStatus || '').toUpperCase()}`,
                  )
                : h(
                    Badge,
                    { variant: 'warning', style: { fontWeight: '700', padding: '4px 10px' } },
                    '⏳ Pending Review',
                  ),
            ),
          ),

          // High-contrast AST / LLM Evidence Box
          item.evidence &&
            h(
              'div',
              {
                style: {
                  padding: '12px 16px',
                  backgroundColor: '#0b0f19',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderLeft: '4px solid #ef4444',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  color: '#e2e8f0',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)',
                },
              },
              h(
                'div',
                {
                  style: {
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                },
                h('span', null, '📍 Bằng chứng vi phạm phát hiện (AST / LLM Evidence):'),
                h(
                  'span',
                  {
                    style: {
                      fontSize: '10px',
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    },
                  },
                  'Confidence: High',
                ),
              ),
              h(
                'div',
                { style: { whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#fca5a5' } },
                typeof item.evidence === 'string'
                  ? item.evidence
                  : JSON.stringify(item.evidence, null, 2),
              ),
            ),

          // Action buttons (Confirm / Overturn)
          !hasReviewed &&
            h(
              'div',
              { style: { display: 'flex', gap: '10px', marginTop: '6px' } },
              // Primary button strictly satisfies Playwright getByRole('button', { name: `Confirm stu1` })
              h(
                Button,
                {
                  variant: 'primary',
                  size: 'sm',
                  onClick: () => handleAction(item, 'confirm'),
                  loading: isConfirming,
                  style: {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontWeight: '700',
                    padding: '6px 18px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                  },
                },
                `✓ ${confirmBtnName}`,
              ),
              h(
                Button,
                {
                  variant: 'danger',
                  size: 'sm',
                  onClick: () => handleAction(item, 'overturn'),
                  loading: isOverturning,
                  style: {
                    fontWeight: '600',
                    padding: '6px 16px',
                  },
                },
                'Overturn (False Positive)',
              ),
            ),
        );
      }),
    ),
  );
}
