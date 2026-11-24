import { h, useState } from '../../../lib/react.js';
import { Card } from '../../../components/ui/index.js';
import { EmptyState } from '../../../components/feedback/index.js';
import { useToast } from '../../../providers/ToastProvider.js';
import { QueueMetricsHeader } from './QueueMetricsHeader.js';
import { ReviewQueueItem } from './ReviewQueueItem.js';

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
      if (setE2eStatusText) setE2eStatusText(reviewedMsg);
    } catch (err) {
      const errMsg = err.detail || err.message || 'Review action failed';
      toast.error(errMsg);
      if (setE2eStatusText) setE2eStatusText(errMsg);
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
      { title: 'Hàng Đợi Xét Duyệt Bài Nộp' },
      h(EmptyState, {
        title: 'Hàng đợi trống',
        description: 'Tất cả bài nộp và quy tắc ràng buộc của bài thực hành này đã được xét duyệt.',
      }),
    );
  }

  return h(
    Card,
    { title: 'Hàng Đợi Xét Duyệt Bài Nộp' },
    h(QueueMetricsHeader, {
      queue,
      pendingCount,
      violationsCount,
      reviewedCount,
    }),
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
      queue.map((item) =>
        h(ReviewQueueItem, {
          key: `${item.id}-${item.constraintCode || item.verdict}`,
          item,
          processingId,
          onAction: handleAction,
        }),
      ),
    ),
  );
}
