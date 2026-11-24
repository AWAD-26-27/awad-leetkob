import { useState, useEffect } from '../../../lib/react.js';
import { useToast } from '../../../providers/ToastProvider.js';
import {
  fetchAdminClasses,
  fetchAdminUsers,
  createAdminClass,
  assignTeacherToClass,
  removeTeacherFromClass,
  createAdminUser,
  assignStudentToClass,
  removeStudentFromClass,
  fetchAllStudents,
} from '../api/index.js';

export function useAdminData() {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, usrRes, stuRes] = await Promise.all([
        fetchAdminClasses(),
        fetchAdminUsers(),
        fetchAllStudents().catch(() => ({ items: [] })),
      ]);
      if (clsRes?.items) setClasses(clsRes.items);
      if (usrRes?.items) setUsers(usrRes.items);
      if (stuRes?.items) setStudents(stuRes.items);
    } catch (err) {
      toast.error(err.detail || err.message || 'Lỗi tải dữ liệu quản trị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClass = async (className) => {
    if (!className.trim()) {
      toast.error('Vui lòng nhập tên lớp học');
      return false;
    }
    try {
      await createAdminClass(className.trim());
      toast.success(`Đã tạo lớp "${className.trim()}" thành công!`);
      await loadData();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể tạo lớp học');
      return false;
    }
  };

  const handleAssignTeacher = async (classId, teacherId) => {
    if (!teacherId) {
      toast.error('Vui lòng chọn Giảng viên cần phân công');
      return false;
    }
    try {
      await assignTeacherToClass(classId, Number(teacherId));
      toast.success('Phân công Giảng viên cho lớp thành công!');
      await loadData();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể phân công giảng viên');
      return false;
    }
  };

  const handleRemoveTeacher = async (classId, teacherId) => {
    try {
      await removeTeacherFromClass(classId, Number(teacherId));
      toast.success('Đã hủy phân công Giảng viên khỏi lớp học!');
      await loadData();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể xóa giảng viên khỏi lớp');
      return false;
    }
  };

  const handleAssignStudent = async (classId, studentId) => {
    if (!studentId) {
      toast.error('Vui lòng chọn Sinh viên cần thêm vào lớp');
      return false;
    }
    try {
      await assignStudentToClass(classId, Number(studentId));
      toast.success('Đã ghi danh Sinh viên vào lớp học thành công!');
      await loadData();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể thêm sinh viên vào lớp');
      return false;
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    try {
      await removeStudentFromClass(classId, Number(studentId));
      toast.success('Đã xóa sinh viên khỏi lớp học thành công!');
      await loadData();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể xóa sinh viên khỏi lớp');
      return false;
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createAdminUser(userData);
      toast.success(
        `Đã tạo tài khoản ${userData.role === 'ta' ? 'Giảng viên' : 'Sinh viên'} "${userData.username.trim()}" thành công!`,
      );
      await loadData();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể tạo tài khoản');
      return false;
    }
  };

  return {
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
  };
}
