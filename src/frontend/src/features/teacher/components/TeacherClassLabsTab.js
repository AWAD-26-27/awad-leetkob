import { h, useState } from '../../../lib/react.js';
import { Card, Button, Badge, Spinner } from '../../../components/ui/index.js';
import { CreateLabForm } from '../../labs/components/CreateLabForm.js';

export function TeacherClassLabsTab({
  classId,
  labs = [],
  onSelectLab,
  onLabCreated,
  loading = false,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    // Header with Create button
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        },
      },
      h(
        'div',
        null,
        h(
          'h3',
          { style: { fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          `Danh Sách Bài Thực Hành (${labs.length})`,
        ),
        h(
          'div',
          { style: { fontSize: '13px', color: '#64748b', marginTop: '2px' } },
          'Chọn một bài Lab để chấm điểm, xem tiến độ nộp bài và xét duyệt vi phạm.',
        ),
      ),
      h(
        Button,
        {
          variant: 'primary',
          onClick: () => setShowCreateModal((prev) => !prev),
          style: { padding: '8px 16px', fontWeight: '600' },
        },
        showCreateModal ? '✕ Đóng form tạo Lab' : '➕ Tạo bài thực hành mới',
      ),
    ),

    // Create Lab section
    showCreateModal &&
      h(
        Card,
        { style: { border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' } },
        h(CreateLabForm, {
          defaultClassId: classId,
          onSuccess: (newLab) => {
            setShowCreateModal(false);
            if (onLabCreated) onLabCreated(newLab);
          },
        }),
      ),

    // Labs Grid
    loading
      ? h(Spinner, { center: true, size: 32, label: 'Đang tải danh sách bài thực hành...' })
      : labs.length === 0
        ? h(
            Card,
            {
              style: {
                padding: '40px',
                textAlign: 'center',
                color: '#64748b',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
              },
            },
            h('div', { style: { fontSize: '36px', marginBottom: '8px' } }, '🧪'),
            h(
              'div',
              { style: { fontWeight: '700', fontSize: '16px', color: '#334155' } },
              'Chưa có bài thực hành nào trong lớp này',
            ),
            h(
              'div',
              { style: { fontSize: '13.5px', marginTop: '4px', marginBottom: '16px' } },
              'Hãy tạo bài thực hành đầu tiên với các test cases và quy tắc ràng buộc.',
            ),
            h(
              Button,
              { variant: 'primary', onClick: () => setShowCreateModal(true) },
              'Tạo bài Lab ngay',
            ),
          )
        : h(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              },
            },
            labs.map((lab) => {
              const isPublished = Boolean(lab.publishedAt);
              return h(
                Card,
                {
                  key: lab.id,
                  style: {
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease',
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
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginBottom: '8px',
                      },
                    },
                    h(
                      'h4',
                      {
                        style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 },
                      },
                      `Lab ${lab.id}: ${lab.title}`,
                    ),
                    h(
                      Badge,
                      { variant: isPublished ? 'success' : 'warning' },
                      isPublished ? 'Đã công bố' : 'Bản nháp',
                    ),
                  ),
                  lab.statement &&
                    h(
                      'div',
                      {
                        style: {
                          fontSize: '13px',
                          color: '#64748b',
                          lineHeight: '1.5',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        },
                      },
                      lab.statement,
                    ),
                ),
                h(
                  'div',
                  {
                    style: {
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  },
                  h(
                    'span',
                    { style: { fontSize: '12.5px', color: '#64748b', fontWeight: '500' } },
                    `Mã bài: #${lab.id}`,
                  ),
                  h(
                    Button,
                    {
                      variant: 'primary',
                      onClick: () => onSelectLab(lab.id),
                      style: { padding: '6px 14px', fontSize: '13px', fontWeight: '600' },
                    },
                    'Vào chi tiết & Bảng điểm →',
                  ),
                ),
              );
            }),
          ),
  );
}
