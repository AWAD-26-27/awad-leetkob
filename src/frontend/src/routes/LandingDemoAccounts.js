import { h } from '../lib/react.js';
import { Card, Button } from '../components/ui/index.js';
import { DEMO_USERS } from '../config/constants.js';

export function LandingDemoAccounts({ onQuickLogin }) {
  const accounts = [
    {
      user: DEMO_USERS[0], // admin
      title: 'Quản trị viên (Admin)',
      badgeColor: '#6366f1',
      badgeBg: '#f5f3ff',
      roleBadge: 'Quản trị',
      desc: 'Quản lý danh mục lớp học, phân công giảng viên và cấp tài khoản người dùng.',
    },
    {
      user: DEMO_USERS[1], // ta_a
      title: 'Trợ giảng Lớp A (TA Alice)',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      roleBadge: 'Trợ giảng',
      desc: 'Quản lý bài thực hành Lớp A, duyệt hàng đợi bài nộp và công bố điểm cho sinh viên.',
    },
    {
      user: DEMO_USERS[2], // ta_b
      title: 'Trợ giảng Lớp B (TA Bob)',
      badgeColor: '#0284c7',
      badgeBg: '#f0f9ff',
      roleBadge: 'Trợ giảng',
      desc: 'Quản lý bài thực hành Lớp B, kiểm tra tính độc lập dữ liệu giữa các lớp.',
    },
    {
      user: DEMO_USERS[3], // student_1
      title: 'Sinh viên (Student 1)',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      roleBadge: 'Sinh viên',
      desc: 'Nộp bài giải C++, kiểm tra trạng thái chấm và theo dõi kết quả sau khi duyệt.',
    },
  ];

  return h(
    'div',
    { style: { marginTop: '12px', marginBottom: '36px' } },
    h(
      'div',
      {
        style: {
          textAlign: 'center',
          marginBottom: '20px',
        },
      },
      h(
        'h2',
        { style: { fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' } },
        'Tài khoản thử nghiệm hệ thống',
      ),
      h(
        'p',
        { style: { fontSize: '14.5px', color: '#64748b', margin: 0 } },
        'Chọn tài khoản mẫu để đăng nhập và trải nghiệm các vai trò trong hệ thống:',
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
        },
      },
      accounts.map((acc) =>
        h(
          Card,
          {
            key: acc.user.username,
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '22px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
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
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                },
              },
              h(
                'span',
                {
                  style: {
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: acc.badgeColor,
                    backgroundColor: acc.badgeBg,
                    padding: '3px 10px',
                    borderRadius: '5px',
                    border: `1px solid ${acc.badgeColor}33`,
                  },
                },
                acc.roleBadge,
              ),
              h(
                'span',
                {
                  style: {
                    fontSize: '13px',
                    color: '#64748b',
                    fontWeight: '500',
                  },
                },
                `@${acc.user.username}`,
              ),
            ),
            h(
              'h3',
              { style: { fontSize: '16.5px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' } },
              acc.title,
            ),
            h(
              'p',
              { style: { fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 18px 0' } },
              acc.desc,
            ),
          ),
          h(
            Button,
            {
              variant: 'secondary',
              size: 'sm',
              onClick: () => onQuickLogin(acc.user.username),
              style: {
                width: '100%',
                fontWeight: '600',
                fontSize: '13.5px',
                padding: '9px 14px',
                backgroundColor: '#ffffff',
                color: '#334155',
                borderColor: '#cbd5e1',
              },
            },
            `Đăng nhập vai trò này`,
          ),
        ),
      ),
    ),
  );
}
