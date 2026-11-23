import { h } from '../../../lib/react.js';
import { Badge } from '../../../components/ui/index.js';

export function SubmissionStepper({ submission }) {
  if (!submission) return null;

  const currentStatus = submission.status; // 'queued' | 'judging' | 'judged'
  const steps = [
    { key: 'queued', icon: '📥', label: '1. Đã xếp hàng', desc: 'Atomic 202 Queued' },
    { key: 'judging', icon: '⚙️', label: '2. Đang chấm', desc: 'Sandbox & AST evaluation' },
    { key: 'judged', icon: '🏁', label: '3. Hoàn tất', desc: 'Verdict & score finalized' },
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
      className: 'animate-fade-in',
      style: {
        padding: '18px 22px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
      },
    },
    // Top summary header
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h(
          'span',
          { style: { fontSize: '15px', fontWeight: '800', letterSpacing: '-0.01em' } },
          `Submission #${submission.id}`,
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
            style: { fontWeight: '700', fontSize: '12px', padding: '4px 10px' },
          },
          `Verdict: ${submission.judgeVerdict}`,
        ),
    ),

    // Animated continuous progress bar line
    h(
      'div',
      {
        style: {
          height: '6px',
          width: '100%',
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '16px',
        },
      },
      h('div', {
        style: {
          height: '100%',
          width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
          borderRadius: '9999px',
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        },
      }),
    ),

    // Progress Bar Steps Cards
    h(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' } },
      steps.map((s, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const borderColor = isCurrent
          ? 'var(--color-primary)'
          : isDone
            ? 'var(--color-success)'
            : 'var(--color-border)';
        const bgColor = isCurrent
          ? 'rgba(37, 99, 235, 0.06)'
          : isDone
            ? 'rgba(16, 185, 129, 0.06)'
            : 'transparent';

        return h(
          'div',
          {
            key: s.key,
            style: {
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${borderColor}`,
              backgroundColor: bgColor,
              transition: 'all 0.2s ease',
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: isCurrent || isDone ? '700' : '600',
                fontSize: '13px',
                color: isCurrent
                  ? 'var(--color-primary)'
                  : isDone
                    ? 'var(--color-success)'
                    : 'var(--color-text-secondary)',
              },
            },
            h('span', { style: { fontSize: '15px' } }, s.icon),
            s.label,
          ),
          h(
            'div',
            {
              style: {
                fontSize: '11.5px',
                color: 'var(--color-text-muted)',
                marginTop: '4px',
                paddingLeft: '23px',
              },
            },
            s.desc,
          ),
        );
      }),
    ),
  );
}
