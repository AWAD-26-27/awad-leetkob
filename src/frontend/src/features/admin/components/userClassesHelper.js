export function getUserClasses(user, allClasses = []) {
  if (!user) return [];
  if (Array.isArray(user.classes) && user.classes.length > 0) {
    return user.classes;
  }
  if (user.role === 'admin') {
    return allClasses.map((c) => ({
      id: c.id,
      name: c.name,
      role: 'Quản trị viên',
      term: 'Toàn hệ thống',
      status: 'Đang hoạt động',
    }));
  }
  if (user.role === 'ta') {
    return allClasses
      .filter((c) => {
        const isAssigned = Array.isArray(c.teachers) && c.teachers.some((t) => t.id === user.id);
        return isAssigned || c.id === user.classId;
      })
      .map((c) => ({
        id: c.id,
        name: c.name,
        role: 'Giảng viên',
        term: 'Học kỳ 1 / 2026',
        status: 'Đang giảng dạy',
      }));
  }
  if (user.role === 'student') {
    return allClasses
      .filter((c) => c.id === user.classId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        role: 'Học viên',
        term: 'Học kỳ 1 / 2026',
        status: 'Đang học',
      }));
  }
  return [];
}
