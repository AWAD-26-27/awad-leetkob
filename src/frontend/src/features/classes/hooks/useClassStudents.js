import { useState, useEffect } from '../../../lib/react.js';
import { useToast } from '../../../providers/ToastProvider.js';
import {
  fetchClassStudents,
  assignStudentApi,
  removeStudentApi,
  fetchAllStudents,
} from '../api/index.js';

export function useClassStudents(classId) {
  const { toast } = useToast();
  const [classStudents, setClassStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const numericClassId = classId ? Number(classId) : null;

  const loadStudents = async () => {
    if (!numericClassId) {
      setClassStudents([]);
      setAllStudents([]);
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch students for this class
      try {
        const classRes = await fetchClassStudents(numericClassId);
        if (classRes?.items && Array.isArray(classRes.items)) {
          setClassStudents(classRes.items);
        } else {
          setClassStudents([]);
        }
      } catch (err) {
        setClassStudents([]);
        toast.error(err.detail || err.message || 'Lỗi tải danh sách sinh viên lớp học');
      }

      // 2. Fetch all students directory for candidate assignment
      try {
        const allRes = await fetchAllStudents();
        if (allRes?.items && Array.isArray(allRes.items)) {
          setAllStudents(allRes.items);
        } else {
          setAllStudents([]);
        }
      } catch {
        // Non-fatal if staff cannot read all students
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [numericClassId]);

  const handleAssignStudent = async (studentId) => {
    if (!studentId) {
      toast.error('Vui lòng chọn sinh viên cần thêm vào lớp');
      return false;
    }
    if (!numericClassId) {
      toast.error('Chưa xác định lớp học');
      return false;
    }
    setAssigning(true);
    try {
      await assignStudentApi(numericClassId, Number(studentId));
      toast.success('Đã thêm sinh viên vào lớp học thành công!');
      await loadStudents();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể gán sinh viên vào lớp');
      return false;
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!numericClassId) return false;
    const shouldRemove =
      typeof globalThis !== 'undefined' && globalThis.confirm
        ? globalThis.confirm(`Bạn có chắc muốn xóa sinh viên "${studentName}" khỏi lớp?`)
        : true;
    if (!shouldRemove) return false;

    try {
      await removeStudentApi(numericClassId, Number(studentId));
      toast.success(`Đã xóa sinh viên "${studentName}" khỏi lớp!`);
      await loadStudents();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể xóa sinh viên khỏi lớp');
      return false;
    }
  };

  const filteredStudents = classStudents.filter((stu) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (stu.name && stu.name.toLowerCase().includes(q)) ||
      (stu.username && stu.username.toLowerCase().includes(q)) ||
      String(stu.id).includes(q)
    );
  });

  return {
    classStudents,
    filteredStudents,
    allStudents,
    loading,
    assigning,
    searchQuery,
    setSearchQuery,
    loadStudents,
    handleAssignStudent,
    handleRemoveStudent,
  };
}
