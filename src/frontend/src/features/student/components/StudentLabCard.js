import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';

export function StudentLabCard({ lab, submissions = [], onSelectLab }) {
  const labSubmissions = submissions.filter((s) => s.labId === lab.id);
  const subCount = labSubmissions.length;
  const hasAccepted = labSubmissions.some(
    (s) => s.judgeVerdict === 'Accepted' || s.judgeVerdict === 'AC',
  );
  const isPending = labSubmissions.some((s) => s.status === 'queued' || s.status === 'judging');
  const latestSub = labSubmissions[0] || null;

  // Determine status: Đã làm / Chưa làm / Làm sai / Đang chấm
  let statusBadge;
  if (subCount === 0) {
    statusBadge = { text: '⚪ Chưa làm', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
  } else if (isPending) {
    statusBadge = { text: '⏳ Đang chấm', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
  } else if (hasAccepted) {
    statusBadge = { text: '✓ Đã làm (Đạt AC)', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
  } else {
    const verdict = latestSub?.judgeVerdict || 'Chưa đạt';
    statusBadge = {
      text: `✕ Làm sai (${verdict})`,
      bg: '#fef2f2',
      color: '#dc2626',
      border: '#fecaca',
    };
  }

  const isPublished = Boolean(lab.publishedAt);
  const bestGrade =
    latestSub && latestSub.grade !== undefined && latestSub.grade !== null ? latestSub.grade : null;

  return h(
    'div',
    {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        transition: 'all 0.15s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      },
    },
    h(
      'div',
      null,
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '8px',
          },
        },
        h(
          'span',
          {
            style: {
              fontSize: '12px',
              padding: '3px 9px',
              borderRadius: '20px',
              backgroundColor: statusBadge.bg,
              color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`,
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
            },
          },
          statusBadge.text,
        ),
        isPublished &&
          h(
            'span',
            {
              style: {
                fontSize: '11.5px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                fontWeight: '500',
              },
            },
            '✓ Đã công bố điểm',
          ),
      ),
      h(
        'h3',
        {
          style: {
            margin: '0 0 6px 0',
            fontSize: '16px',
            fontWeight: '700',
            color: '#0f172a',
            lineHeight: '1.4',
          },
        },
        lab.title || `Lab #${lab.id}`,
      ),
      h(
        'p',
        {
          style: {
            margin: 0,
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          },
        },
        lab.statement || 'Không có mô tả chi tiết.',
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          flexWrap: 'wrap',
          gap: '10px',
        },
      },
      h(
        'div',
        { style: { fontSize: '12.5px', color: '#64748b' } },
        h(
          'span',
          null,
          `Đã nộp: `,
          h('strong', { style: { color: '#0f172a' } }, `${subCount} lần`),
        ),
        isPublished &&
          bestGrade !== null &&
          h(
            'span',
            { style: { marginLeft: '10px', color: '#059669', fontWeight: '700' } },
            `• Điểm: ${bestGrade}/10`,
          ),
      ),
      h(
        Button,
        {
          variant: subCount > 0 ? 'outline' : 'primary',
          size: 'sm',
          onClick: () => onSelectLab(lab.id),
          style: { fontSize: '13px', padding: '6px 14px', fontWeight: '600' },
        },
        subCount > 0 ? 'Xem & làm lại →' : 'Vào làm bài →',
      ),
    ),
  );
}
