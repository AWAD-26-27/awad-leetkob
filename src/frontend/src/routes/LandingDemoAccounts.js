import { h } from '../lib/react.js';
import { Card, Button } from '../components/ui/index.js';
import { useAuth } from '../providers/AuthProvider.js';

export function LandingDemoAccounts({ onOpenLogin }) {
  const { savedAccounts = [], loginWithSavedAccount } = useAuth();

  // If there are accounts that previously logged in with password on this device,
  // show them as quick login cards ("khi ấn vào login thẳng vào").
  if (savedAccounts && savedAccounts.length > 0) {
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
          'Tài khoản đã đăng nhập gần đây',
        ),
        h(
          'p',
          { style: { fontSize: '14.5px', color: '#64748b', margin: 0 } },
          'Nhấn vào tài khoản đã lưu trên thiết bị để đăng nhập nhanh:',
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
        savedAccounts.map((acc) => {
          const roleColor =
            acc.role === 'admin' ? '#8b5cf6' : acc.role === 'ta' ? '#2563eb' : '#10b981';
          const roleBg =
            acc.role === 'admin' ? '#f5f3ff' : acc.role === 'ta' ? '#eff6ff' : '#ecfdf5';
          const roleLabel =
            acc.role === 'admin'
              ? 'Quản trị viên'
              : acc.role === 'ta'
                ? acc.classId
                  ? `Giảng viên (Lớp ${acc.classId})`
                  : 'Giảng viên'
                : acc.classId
                  ? `Sinh viên (Lớp ${acc.classId})`
                  : 'Sinh viên';

          return h(
            Card,
            {
              key: acc.username,
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
                      color: roleColor,
                      backgroundColor: roleBg,
                      padding: '3px 10px',
                      borderRadius: '5px',
                      border: `1px solid ${roleColor}33`,
                    },
                  },
                  roleLabel,
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
                  `@${acc.username}`,
                ),
              ),
              h(
                'h3',
                {
                  style: {
                    fontSize: '16.5px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 8px 0',
                  },
                },
                acc.name || acc.username,
              ),
              h(
                'p',
                {
                  style: {
                    fontSize: '13.5px',
                    color: '#64748b',
                    lineHeight: 1.6,
                    margin: '0 0 18px 0',
                  },
                },
                `Tài khoản đã xác thực mật khẩu trên trình duyệt này. Nhấn nút bên dưới để vào phiên làm việc.`,
              ),
            ),
            h(
              Button,
              {
                variant: 'primary',
                size: 'sm',
                onClick: () => loginWithSavedAccount(acc),
                style: {
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '13.5px',
                  padding: '9px 14px',
                },
              },
              'Đăng nhập ngay →',
            ),
          );
        }),
      ),
    );
  }

  // When no accounts have logged in with password yet, display clean role overview
  // without hardcoding or leaking any credentials.
  const roleCards = [
    {
      title: 'Quản trị viên (Admin)',
      badgeColor: '#8b5cf6',
      badgeBg: '#f5f3ff',
      roleBadge: 'Quản trị',
      desc: 'Quản trị danh mục lớp học, phân công giảng viên và cấp phát tài khoản toàn hệ thống.',
    },
    {
      title: 'Giảng viên / Trợ giảng (TA)',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      roleBadge: 'Giảng viên',
      desc: 'Biên soạn đề bài thực hành C++, đối soát vi phạm cú pháp AST và công bố điểm số.',
    },
    {
      title: 'Sinh viên (Student)',
      badgeColor: '#10b981',
      badgeBg: '#ecfdf5',
      roleBadge: 'Sinh viên',
      desc: 'Nộp mã nguồn C++ giải bài tập, kiểm tra trạng thái chấm và theo dõi kết quả sau khi duyệt.',
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
        'Cơ cấu phân quyền người dùng',
      ),
      h(
        'p',
        { style: { fontSize: '14.5px', color: '#64748b', margin: 0 } },
        'Hệ thống phân cấp 3 vai trò rõ ràng với ranh giới bảo mật nghiêm ngặt:',
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
      roleCards.map((rc) =>
        h(
          Card,
          {
            key: rc.title,
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
                  marginBottom: '12px',
                },
              },
              h(
                'span',
                {
                  style: {
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: rc.badgeColor,
                    backgroundColor: rc.badgeBg,
                    padding: '3px 10px',
                    borderRadius: '5px',
                    border: `1px solid ${rc.badgeColor}33`,
                  },
                },
                rc.roleBadge,
              ),
            ),
            h(
              'h3',
              {
                style: {
                  fontSize: '16.5px',
                  fontWeight: '700',
                  color: '#0f172a',
                  margin: '0 0 8px 0',
                },
              },
              rc.title,
            ),
            h(
              'p',
              {
                style: {
                  fontSize: '13.5px',
                  color: '#64748b',
                  lineHeight: 1.6,
                  margin: '0 0 18px 0',
                },
              },
              rc.desc,
            ),
          ),
          h(
            Button,
            {
              variant: 'secondary',
              size: 'sm',
              onClick: onOpenLogin,
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
            'Đăng nhập tài khoản',
          ),
        ),
      ),
    ),
  );
}
