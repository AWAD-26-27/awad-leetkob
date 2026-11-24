import { h } from '../../../lib/react.js';
import { useAdminData } from '../hooks/index.js';
import { AdminHeader } from './AdminHeader.js';
import { ClassManagementCard } from './ClassManagementCard.js';
import { UserCreationCard } from './UserCreationCard.js';
import { UserDirectoryTable } from './UserDirectoryTable.js';

export function AdminDashboard() {
  const {
    classes,
    users,
    loading,
    selectedTeachers,
    setSelectedTeachers,
    loadData,
    handleCreateClass,
    handleAssignTeacher,
    handleCreateUser,
  } = useAdminData();

  const teachers = users.filter((u) => u.role === 'ta');

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '28px' } },
    h(AdminHeader, { onRefresh: loadData, loading }),
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        },
      },
      h(ClassManagementCard, {
        classes,
        teachers,
        selectedTeachers,
        onSelectTeacher: (classId, teacherId) =>
          setSelectedTeachers((prev) => ({ ...prev, [classId]: teacherId })),
        onCreateClass: handleCreateClass,
        onAssignTeacher: (classId) => handleAssignTeacher(classId, selectedTeachers[classId]),
      }),
      h(UserCreationCard, {
        classes,
        userCount: users.length,
        onCreateUser: handleCreateUser,
      }),
    ),
    h(UserDirectoryTable, { users, classes }),
  );
}
