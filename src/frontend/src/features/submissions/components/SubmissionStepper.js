import { h } from '../../../lib/react.js';
import { Badge } from '../../../components/ui/index.js';

export function SubmissionStepper({ submission }) {
  if (!submission) return null;

  const currentStatus = submission.status;
  const steps = [
    { key: 'queued', label: '1. Tiếp nhận', desc: 'Đã nhận bài vào hàng đợi' },
    { key: 'judging', label: '2. Đang chấm', desc: 'Biên dịch và chạy kiểm thử' },
    { key: 'judged', label: '3. Hoàn tất', desc: 'Đã ghi nhận kết quả' },
  ];

  const getStepIndex = (status) => {
    if (status === 'queued') return 0;
    if (status === 'judging') return 1;
    if (status === 'judged') return 2;
    return 0;
  };

  const currentIndex = getStepIndex(currentStatus);
  const progressPercent = currentIndex === 0 ? 33 : currentIndex === 1 ? 66 : 100;

  return h(
    'div',
    {
      style: {
        padding: '16px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '20px',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h(
          'span',
          { style: { fontSize: '14px', fontWeight: '700', color: '#0f172a' } },
          `Bài nộp #${submission.id}`,
        ),
        h(
          Badge,
          {
            variant:
              currentStatus === 'judged'
                ? 'success'
                : currentStatus === 'judging'
                  ? 'info'
                  : 'warning',
          },
          currentStatus.toUpperCase(),
        ),
      ),
      submission.judgeVerdict &&
        h(
          Badge,
          {
            variant:
              submission.judgeVerdict === 'Accepted' || submission.judgeVerdict === 'AC'
                ? 'success'
                : 'danger',
            style: { fontWeight: '600', fontSize: '12px', padding: '3px 8px' },
          },
          `Kết quả: ${submission.judgeVerdict}`,
        ),
    ),
    h(
      'div',
      {
        style: {
          height: '4px',
          width: '100%',
          backgroundColor: '#f1f5f9',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '14px',
        },
      },
      h('div', {
        style: {
          height: '100%',
          width: `${progressPercent}%`,
          backgroundColor: '#2563eb',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        },
      }),
    ),
    h(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' } },
      steps.map((s, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const borderColor = isCurrent ? '#2563eb' : isDone ? '#10b981' : '#e2e8f0';
        const bgColor = isCurrent ? '#eff6ff' : isDone ? '#f0fdf4' : '#ffffff';

        return h(
          'div',
          {
            key: s.key,
            style: {
              padding: '10px 12px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: bgColor,
            },
          },
          h(
            'div',
            {
              style: {
                fontWeight: isCurrent || isDone ? '600' : '500',
                fontSize: '12.5px',
                color: isCurrent ? '#1d4ed8' : isDone ? '#047857' : '#64748b',
              },
            },
            s.label,
          ),
          h(
            'div',
            {
              style: {
                fontSize: '11px',
                color: '#64748b',
                marginTop: '2px',
              },
            },
            s.desc,
          ),
        );
      }),
    ),
  );
}
