import { h } from '../lib/react.js';
import { Card } from '../components/ui/index.js';

export function LandingFeatures() {
  const features = [
    {
      step: '01',
      title: 'Biên dịch & kiểm thử độc lập',
      desc: 'Mã nguồn sinh viên được biên dịch và chạy trong môi trường cô lập, kiểm soát giới hạn thời gian (Time Limit) và bộ nhớ (Memory Limit) cho từng bài nộp.',
    },
    {
      step: '02',
      title: 'Kiểm tra ràng buộc mã nguồn',
      desc: 'Phân tích cú pháp để xác minh yêu cầu bài tập, phát hiện các hàm, vòng lặp hoặc thư viện bị giới hạn theo từng bài thực hành.',
    },
    {
      step: '03',
      title: 'Xét duyệt & công bố điểm',
      desc: 'Hỗ trợ trợ giảng xem lại các trường hợp nghi vấn vi phạm ràng buộc và xác nhận kết quả trước khi chính thức công bố điểm cho sinh viên.',
    },
    {
      step: '04',
      title: 'Phân quyền theo lớp học',
      desc: 'Quản lý dữ liệu và danh sách sinh viên phân tách theo từng lớp, bảo đảm tính độc lập và riêng tư giữa các lớp học.',
    },
  ];

  return h(
    'div',
    { style: { marginBottom: '32px' } },
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        },
      },
      features.map((f, idx) =>
        h(
          Card,
          {
            key: idx,
            style: {
              padding: '22px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
            },
          },
          h(
            'div',
            {
              style: {
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13.5px',
                fontWeight: '700',
                marginBottom: '14px',
                border: '1px solid #e2e8f0',
              },
            },
            f.step,
          ),
          h(
            'h4',
            { style: { fontSize: '16.5px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' } },
            f.title,
          ),
          h(
            'p',
            { style: { fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 } },
            f.desc,
          ),
        ),
      ),
    ),
  );
}
