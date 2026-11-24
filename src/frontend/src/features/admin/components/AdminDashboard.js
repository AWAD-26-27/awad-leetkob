import { h, useState } from '../../../lib/react.js';
import { useAdminData } from '../hooks/index.js';
import { AdminHeader } from './AdminHeader.js';
import { ClassManagementCard } from './ClassManagementCard.js';
import { UserCreationCard } from './UserCreationCard.js';
import { UserDirectoryTable } from './UserDirectoryTable.js';
import { BookOpenIcon, UsersIcon } from './AdminIcons.js';

export function AdminDashboard() {
  const [activeAdminTab, setActiveAdminTab] = useState('classes'); // 'classes' | 'users'
  const {
    classes,
    users,
    students,
    loading,
    selectedTeachers,
    setSelectedTeachers,
    loadData,
    handleCreateClass,
    handleAssignTeacher,
    handleRemoveTeacher,
    handleAssignStudent,
    handleRemoveStudent,
    handleCreateUser,
  } = useAdminData();

  const teachers = users.filter((u) => u.role === 'ta');

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
    h(AdminHeader, {
      onRefresh: loadData,
      loading,
    }),
    // Clean Tab Navigation Bar
    h(
      'div',
      {
        style: {
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0px',
        },
      },
      h(
        'button',
        {
          type: 'button',
          onClick: () => setActiveAdminTab('classes'),
          style: {
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeAdminTab === 'classes' ? '600' : '500',
            border: 'none',
            borderBottom:
              activeAdminTab === 'classes' ? '2px solid #2563eb' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeAdminTab === 'classes' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-1px',
          },
        },
        h(BookOpenIcon, { size: 15, style: { opacity: activeAdminTab === 'classes' ? 1 : 0.7 } }),
        'Lớp học & Phân công',
        h(
          'span',
          {
            style: {
              fontSize: '11px',
              fontWeight: '600',
              padding: '1px 7px',
              borderRadius: '9999px',
              backgroundColor: activeAdminTab === 'classes' ? '#eff6ff' : '#f1f5f9',
              color: activeAdminTab === 'classes' ? '#2563eb' : '#64748b',
            },
          },
          classes.length,
        ),
      ),
      h(
        'button',
        {
          type: 'button',
          onClick: () => setActiveAdminTab('users'),
          style: {
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeAdminTab === 'users' ? '600' : '500',
            border: 'none',
            borderBottom:
              activeAdminTab === 'users' ? '2px solid #2563eb' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeAdminTab === 'users' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-1px',
          },
        },
        h(UsersIcon, { size: 15, style: { opacity: activeAdminTab === 'users' ? 1 : 0.7 } }),
        'Người dùng & Cấp phát',
        h(
          'span',
          {
            style: {
              fontSize: '11px',
              fontWeight: '600',
              padding: '1px 7px',
              borderRadius: '9999px',
              backgroundColor: activeAdminTab === 'users' ? '#eff6ff' : '#f1f5f9',
              color: activeAdminTab === 'users' ? '#2563eb' : '#64748b',
            },
          },
          users.length,
        ),
      ),
    ),
    // Tab Contents
    activeAdminTab === 'classes'
      ? h(ClassManagementCard, {
          classes,
          teachers,
          allStudents: students,
          selectedTeachers,
          onSelectTeacher: (classId, teacherId) =>
            setSelectedTeachers((prev) => ({ ...prev, [classId]: teacherId })),
          onCreateClass: handleCreateClass,
          onAssignTeacher: (classId) => handleAssignTeacher(classId, selectedTeachers[classId]),
          onRemoveTeacher: handleRemoveTeacher,
          onAssignStudent: handleAssignStudent,
          onRemoveStudent: handleRemoveStudent,
          onRosterChange: loadData,
        })
      : h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
          h(UserCreationCard, {
            classes,
            userCount: users.length,
            onCreateUser: handleCreateUser,
          }),
          h(UserDirectoryTable, { users, classes }),
        ),
  );
}
