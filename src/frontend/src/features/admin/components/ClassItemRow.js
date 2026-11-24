import { h, useState, useEffect } from '../../../lib/react.js';
import { Button, Spinner } from '../../../components/ui/index.js';
import { fetchClassStudents } from '../api/index.js';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, RefreshIcon } from './AdminIcons.js';

export function ClassItemRow({
  cls,
  teachers = [],
  allStudents = [],
  selectedTeacherId,
  onSelectTeacher,
  onAssignTeacher,
  onRemoveTeacher,
  onAssignStudent,
  onRemoveStudent,
  onRosterChange,
}) {
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Filter & Search states for adding student
  const [studentSearch, setStudentSearch] = useState('');
  const [onlyUnassigned, setOnlyUnassigned] = useState(true);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');
  const [assigningStudent, setAssigningStudent] = useState(false);

  const assignedTeacher = cls.teachers && cls.teachers.length > 0 ? cls.teachers[0] : null;

  // Load students of this class when panel is opened
  const loadClassStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetchClassStudents(cls.id);
      if (res?.items) setStudents(res.items);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (showStudents) loadClassStudents();
  }, [showStudents, cls.id]);

  // Handle adding student
  const handleAddStudentSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!selectedStudentToAdd) return;
    setAssigningStudent(true);
    if (onAssignStudent) {
      await onAssignStudent(cls.id, Number(selectedStudentToAdd));
      setSelectedStudentToAdd('');
      await loadClassStudents();
      if (onRosterChange) onRosterChange();
    }
    setAssigningStudent(false);
  };

  // Handle removing student
  const handleRemoveStudentClick = async (studentId) => {
    if (onRemoveStudent) {
      await onRemoveStudent(cls.id, studentId);
      await loadClassStudents();
      if (onRosterChange) onRosterChange();
    }
  };

  // Candidates for adding to this class
  const candidateStudents = allStudents.filter((s) => {
    if (Number(s.classId) === Number(cls.id)) return false; // already in this class
    if (onlyUnassigned && s.classId) return false;
    if (studentSearch.trim()) {
      const query = studentSearch.toLowerCase().trim();
      const matchName = s.name && s.name.toLowerCase().includes(query);
      const matchUser = s.username && s.username.toLowerCase().includes(query);
      if (!matchName && !matchUser) return false;
    }
    return true;
  });

  return h(
    'div',
    {
      key: cls.id,
      style: {
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
      },
    },
    // Class Header & Main Actions
    h(
      'div',
      {
        style: {
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          },
        },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          h(
            'span',
            {
              style: {
                fontWeight: '700',
                fontSize: '15px',
                color: '#0f172a',
              },
            },
            cls.name,
          ),
          h(
            'span',
            {
              style: {
                fontSize: '11px',
                fontWeight: '500',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
              },
            },
            `#${cls.id}`,
          ),
        ),
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
          h(
            'span',
            {
              style: {
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: cls.studentCount > 0 ? '#ecfdf5' : '#f8fafc',
                color: cls.studentCount > 0 ? '#065f46' : '#64748b',
                border: `1px solid ${cls.studentCount > 0 ? '#a7f3d0' : '#e2e8f0'}`,
                fontWeight: '600',
              },
            },
            `${cls.studentCount || 0} học viên`,
          ),
          h(
            'button',
            {
              type: 'button',
              onClick: () => setShowStudents(!showStudents),
              style: {
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '500',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: showStudents ? '#2563eb' : '#cbd5e1',
                backgroundColor: showStudents ? '#eff6ff' : '#ffffff',
                color: showStudents ? '#2563eb' : '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              },
            },
            showStudents ? 'Thu gọn' : 'Quản lý học viên',
            showStudents ? h(ChevronUpIcon, { size: 12 }) : h(ChevronDownIcon, { size: 12 }),
          ),
        ),
      ),
      // Teacher Assignment Line
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            flexWrap: 'wrap',
          },
        },
        h('span', { style: { color: '#64748b', fontWeight: '500' } }, 'Giảng viên phụ trách:'),
        assignedTeacher
          ? h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
              h(
                'span',
                {
                  style: {
                    fontWeight: '600',
                    color: '#1e40af',
                    backgroundColor: '#eff6ff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #dbeafe',
                    fontSize: '12px',
                  },
                },
                `${assignedTeacher.name} (@${assignedTeacher.username})`,
              ),
              onRemoveTeacher &&
                h(
                  'button',
                  {
                    type: 'button',
                    onClick: () => onRemoveTeacher(cls.id, assignedTeacher.id),
                    style: {
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    },
                  },
                  'Gỡ GV',
                ),
            )
          : h(
              'span',
              {
                style: {
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontStyle: 'italic',
                },
              },
              'Chưa phân công',
            ),
        h(
          'div',
          { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' } },
          h(
            'select',
            {
              value: selectedTeacherId || '',
              onChange: (e) => onSelectTeacher && onSelectTeacher(cls.id, e.target.value),
              style: {
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                maxWidth: '180px',
              },
            },
            h('option', { value: '' }, '-- Chọn giảng viên --'),
            teachers.map((t) =>
              h(
                'option',
                { key: t.id, value: t.id },
                `${t.name} (@${t.username})${t.classId ? ` [Lớp ${t.classId}]` : ' [Chưa gán]'}`,
              ),
            ),
          ),
          h(
            Button,
            {
              size: 'sm',
              variant: assignedTeacher ? 'outline' : 'primary',
              onClick: () => onAssignTeacher && onAssignTeacher(cls.id),
              style: { fontSize: '11.5px', padding: '3px 9px' },
            },
            assignedTeacher ? 'Đổi GV' : 'Phân công',
          ),
        ),
      ),
    ),
    // Sub-view: Students Management
    showStudents &&
      h(
        'div',
        {
          style: {
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          },
        },
        // Add Student Form with Filter & Search
        h(
          'form',
          {
            onSubmit: handleAddStudentSubmit,
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: '#ffffff',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '6px',
              },
            },
            h(
              'span',
              { style: { fontSize: '12.5px', fontWeight: '600', color: '#0f172a' } },
              'Thêm học viên vào lớp',
            ),
            h(
              'label',
              {
                style: {
                  fontSize: '12px',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                },
              },
              h('input', {
                type: 'checkbox',
                checked: onlyUnassigned,
                onChange: (e) => setOnlyUnassigned(e.target.checked),
              }),
              'Chỉ hiện học viên chưa có lớp',
            ),
          ),
          h(
            'div',
            { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            h('input', {
              type: 'text',
              placeholder: 'Lọc theo tên hoặc username...',
              value: studentSearch,
              onChange: (e) => setStudentSearch(e.target.value),
              style: {
                flex: 1,
                minWidth: '160px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
              },
            }),
            h(
              'select',
              {
                value: selectedStudentToAdd,
                onChange: (e) => setSelectedStudentToAdd(e.target.value),
                style: {
                  flex: 2,
                  minWidth: '200px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                },
              },
              h(
                'option',
                { value: '' },
                candidateStudents.length > 0
                  ? `-- Chọn học viên (${candidateStudents.length} khả dụng) --`
                  : '-- Không tìm thấy học viên phù hợp --',
              ),
              candidateStudents.map((s) =>
                h(
                  'option',
                  { key: s.id, value: s.id },
                  `${s.name} (@${s.username})${s.classId ? ` [Lớp ${s.classId}]` : ' [Chưa có lớp]'}`,
                ),
              ),
            ),
            h(
              Button,
              {
                type: 'submit',
                size: 'sm',
                variant: 'primary',
                disabled: assigningStudent || !selectedStudentToAdd,
                style: {
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                },
              },
              h(PlusIcon, { size: 12 }),
              assigningStudent ? 'Đang thêm...' : 'Thêm SV',
            ),
          ),
        ),
        // Enrolled Students Table
        h(
          'div',
          null,
          h(
            'div',
            {
              style: {
                fontSize: '12.5px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            },
            h('span', null, `Học viên đã ghi danh (${students.length})`),
            h(
              'button',
              {
                type: 'button',
                onClick: loadClassStudents,
                style: {
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                },
              },
              h(RefreshIcon, { size: 11 }),
              'Tải lại',
            ),
          ),
          loadingStudents
            ? h(
                'div',
                { style: { padding: '16px', display: 'flex', justifyContent: 'center' } },
                h(Spinner, { inline: true, size: 16, label: 'Đang tải danh sách sinh viên...' }),
              )
            : students.length === 0
              ? h(
                  'div',
                  {
                    style: {
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '12.5px',
                      border: '1px dashed #cbd5e1',
                    },
                  },
                  'Lớp học chưa có học viên nào. Chọn học viên ở trên để thêm vào lớp.',
                )
              : h(
                  'div',
                  {
                    style: {
                      overflowX: 'auto',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    },
                  },
                  h(
                    'table',
                    { style: { width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' } },
                    h(
                      'thead',
                      null,
                      h(
                        'tr',
                        {
                          style: {
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            textAlign: 'left',
                            color: '#64748b',
                          },
                        },
                        h('th', { style: { padding: '8px 12px', fontWeight: '600' } }, 'ID'),
                        h('th', { style: { padding: '8px 12px', fontWeight: '600' } }, 'Họ và tên'),
                        h(
                          'th',
                          { style: { padding: '8px 12px', fontWeight: '600' } },
                          'Tên đăng nhập',
                        ),
                        h(
                          'th',
                          { style: { padding: '8px 12px', fontWeight: '600', textAlign: 'right' } },
                          'Thao tác',
                        ),
                      ),
                    ),
                    h(
                      'tbody',
                      null,
                      students.map((stu) =>
                        h(
                          'tr',
                          { key: stu.id, style: { borderBottom: '1px solid #f1f5f9' } },
                          h(
                            'td',
                            { style: { padding: '8px 12px', color: '#64748b' } },
                            `#${stu.id}`,
                          ),
                          h(
                            'td',
                            { style: { padding: '8px 12px', color: '#0f172a', fontWeight: '500' } },
                            stu.name,
                          ),
                          h(
                            'td',
                            {
                              style: {
                                padding: '8px 12px',
                                fontFamily: 'monospace',
                                color: '#475569',
                              },
                            },
                            `@${stu.username}`,
                          ),
                          h(
                            'td',
                            { style: { padding: '8px 12px', textAlign: 'right' } },
                            h(
                              'button',
                              {
                                type: 'button',
                                onClick: () => handleRemoveStudentClick(stu.id),
                                style: {
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  color: '#dc2626',
                                  backgroundColor: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                },
                              },
                              'Xóa khỏi lớp',
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
        ),
      ),
  );
}
