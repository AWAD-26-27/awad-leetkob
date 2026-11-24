import { h, useState, useMemo } from '../../../lib/react.js';
import { Card, Input, Spinner } from '../../../components/ui/index.js';

export function TeacherClassRosterTab({ students = [], loading = false }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase().trim();
    return students.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.username && s.username.toLowerCase().includes(q)) ||
        String(s.id).includes(q),
    );
  }, [students, search]);

  return h(
    Card,
    { style: { padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px' } },
    // Header & Search
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        },
      },
      h(
        'div',
        null,
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          h('span', { style: { fontSize: '18px' } }, '👥'),
          h(
            'h3',
            { style: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 } },
            'Danh Sách Sinh Viên Lớp Học',
          ),
          h(
            'span',
            {
              style: {
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '2px 8px',
                borderRadius: '12px',
              },
            },
            `${students.length} Sinh viên`,
          ),
        ),
        h(
          'div',
          { style: { fontSize: '13px', color: '#64748b', marginTop: '4px' } },
          'Danh sách do Quản trị viên phân công. Giảng viên chỉ xem để quản lý và theo dõi điểm số.',
        ),
      ),
      h(
        'div',
        { style: { minWidth: '240px' } },
        h(Input, {
          placeholder: '🔍 Tìm theo tên hoặc mã SV...',
          value: search,
          onChange: (e) => setSearch(e.target.value),
          style: { width: '100%' },
        }),
      ),
    ),

    // Roster Table
    loading
      ? h(Spinner, { center: true, size: 32, label: 'Đang tải danh sách sinh viên...' })
      : filtered.length === 0
        ? h(
            'div',
            {
              style: {
                padding: '40px',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
              },
            },
            h('div', { style: { fontSize: '32px', marginBottom: '8px' } }, '👨‍🎓'),
            h(
              'div',
              { style: { fontWeight: '600', color: '#334155' } },
              'Chưa có sinh viên nào trong lớp',
            ),
            h(
              'div',
              { style: { fontSize: '13px', marginTop: '4px' } },
              'Quản trị viên (Admin) chưa gán sinh viên vào lớp học này.',
            ),
          )
        : h(
            'div',
            { style: { overflowX: 'auto' } },
            h(
              'table',
              {
                style: {
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '13.5px',
                },
              },
              h(
                'thead',
                null,
                h(
                  'tr',
                  {
                    style: {
                      borderBottom: '2px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: '600',
                    },
                  },
                  h('th', { style: { padding: '12px 14px', width: '60px' } }, 'STT'),
                  h('th', { style: { padding: '12px 14px', width: '100px' } }, 'Mã SV'),
                  h('th', { style: { padding: '12px 14px' } }, 'Họ và tên'),
                  h('th', { style: { padding: '12px 14px' } }, 'Tên đăng nhập'),
                  h(
                    'th',
                    { style: { padding: '12px 14px', textAlign: 'center', width: '130px' } },
                    'Trạng thái',
                  ),
                ),
              ),
              h(
                'tbody',
                null,
                filtered.map((stu, idx) =>
                  h(
                    'tr',
                    {
                      key: stu.id,
                      style: {
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      },
                    },
                    h(
                      'td',
                      { style: { padding: '12px 14px', color: '#64748b', fontWeight: '500' } },
                      idx + 1,
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 14px', fontWeight: '700', color: '#0f172a' } },
                      `#${stu.id}`,
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 14px', fontWeight: '600', color: '#1e293b' } },
                      stu.name || stu.username,
                    ),
                    h(
                      'td',
                      {
                        style: { padding: '12px 14px', color: '#2563eb', fontFamily: 'monospace' },
                      },
                      `@${stu.username}`,
                    ),
                    h(
                      'td',
                      { style: { padding: '12px 14px', textAlign: 'center' } },
                      h(
                        'span',
                        {
                          style: {
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #a7f3d0',
                          },
                        },
                        'Đang học',
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
  );
}
