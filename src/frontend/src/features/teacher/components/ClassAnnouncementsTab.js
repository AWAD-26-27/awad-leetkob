import { h, useState } from '../../../lib/react.js';
import { Card, Button, Input, Textarea } from '../../../components/ui/index.js';
import { formatTime } from '../../../utils/formatTime.js';

export function ClassAnnouncementsTab({ announcements = [], onPostAnnouncement, posting = false }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!title.trim() || !content.trim()) return;
    onPostAnnouncement({ title: title.trim(), content: content.trim() });
    setTitle('');
    setContent('');
  };

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '24px' } },
    // Create announcement card
    h(
      Card,
      { style: { padding: '20px 24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' } },
        h('span', { style: { fontSize: '18px' } }, '📢'),
        h(
          'h3',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          'Đăng Thông Báo Mới',
        ),
      ),
      h(
        'form',
        {
          onSubmit: handleSubmit,
          style: { display: 'flex', flexDirection: 'column', gap: '14px' },
        },
        h(
          'div',
          null,
          h(
            'label',
            {
              style: {
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '6px',
              },
            },
            'Tiêu đề thông báo:',
          ),
          h(Input, {
            placeholder: 'Ví dụ: Nhắc nhở hạn nộp bài Lab 1...',
            value: title,
            onChange: (e) => setTitle(e.target.value),
            required: true,
            style: { width: '100%' },
          }),
        ),
        h(
          'div',
          null,
          h(
            'label',
            {
              style: {
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '6px',
              },
            },
            'Nội dung thông báo:',
          ),
          h(Textarea, {
            placeholder: 'Nhập nội dung thông báo cho toàn thể sinh viên trong lớp...',
            value: content,
            onChange: (e) => setContent(e.target.value),
            rows: 3,
            required: true,
            style: { width: '100%', resize: 'vertical' },
          }),
        ),
        h(
          'div',
          { style: { display: 'flex', justifyContent: 'flex-end' } },
          h(
            Button,
            {
              type: 'submit',
              variant: 'primary',
              disabled: posting || !title.trim() || !content.trim(),
              style: { padding: '8px 20px', fontWeight: '600' },
            },
            posting ? 'Đang gửi...' : '📨 Đăng thông báo',
          ),
        ),
      ),
    ),

    // Announcement List
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h(
          'h3',
          { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
          `Bảng Tin Thông Báo (${announcements.length})`,
        ),
      ),
      announcements.length === 0
        ? h(
            Card,
            {
              style: {
                padding: '36px',
                textAlign: 'center',
                color: '#64748b',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
              },
            },
            h('div', { style: { fontSize: '32px', marginBottom: '8px' } }, '📭'),
            h(
              'div',
              { style: { fontWeight: '600', fontSize: '15px', color: '#334155' } },
              'Chưa có thông báo nào',
            ),
            h(
              'div',
              { style: { fontSize: '13px', marginTop: '4px' } },
              'Hãy tạo thông báo đầu tiên để truyền đạt thông tin đến sinh viên lớp học.',
            ),
          )
        : announcements.map((item) =>
            h(
              Card,
              {
                key: item.id,
                style: { padding: '18px 22px', border: '1px solid #e2e8f0', borderRadius: '10px' },
              },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px',
                  },
                },
                h(
                  'h4',
                  { style: { fontSize: '15.5px', fontWeight: '700', color: '#0f172a', margin: 0 } },
                  item.title,
                ),
                h(
                  'span',
                  {
                    style: {
                      fontSize: '12px',
                      color: '#64748b',
                      backgroundColor: '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    },
                  },
                  formatTime(item.createdAt),
                ),
              ),
              h(
                'div',
                {
                  style: {
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                  },
                },
                item.content,
              ),
              h(
                'div',
                {
                  style: {
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  },
                },
                'Đăng bởi: ',
                h(
                  'strong',
                  { style: { color: '#64748b' } },
                  item.authorName || item.authorUsername || 'Giảng viên',
                ),
              ),
            ),
          ),
    ),
  );
}
