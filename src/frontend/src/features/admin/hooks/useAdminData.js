import { useState, useEffect } from '../../../lib/react.js';
import { useToast } from '../../../providers/ToastProvider.js';
import {
  fetchAdminClasses,
  fetchAdminUsers,
  createAdminClass,
  assignTeacherToClass,
  createAdminUser,
} from '../api/index.js';

export function useAdminData() {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, usrRes] = await Promise.all([fetchAdminClasses(), fetchAdminUsers()]);
      if (clsRes?.items) setClasses(clsRes.items);
      if (usrRes?.items) setUsers(usrRes.items);
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
    loading,
    selectedTeachers,
    setSelectedTeachers,
    loadData,
    handleCreateClass,
    handleAssignTeacher,
    handleCreateUser,
  };
}
