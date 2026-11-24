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

  const loadStudents = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const [classRes, allRes] = await Promise.all([
        fetchClassStudents(classId),
        fetchAllStudents(),
      ]);
      if (classRes?.items) setClassStudents(classRes.items);
      if (allRes?.items) setAllStudents(allRes.items);
    } catch (err) {
      toast.error(err.detail || err.message || 'Lỗi tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [classId]);

  const handleAssignStudent = async (studentId) => {
    if (!studentId) {
      toast.error('Vui lòng chọn sinh viên cần thêm vào lớp');
      return false;
    }
    setAssigning(true);
    try {
      await assignStudentApi(classId, Number(studentId));
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
    const shouldRemove =
      typeof globalThis !== 'undefined' && globalThis.confirm
        ? globalThis.confirm(`Bạn có chắc muốn xóa sinh viên "${studentName}" khỏi lớp?`)
        : true;
    if (!shouldRemove) return false;

    try {
      await removeStudentApi(classId, studentId);
      toast.success(`Đã xóa sinh viên "${studentName}" khỏi lớp!`);
      await loadStudents();
      return true;
    } catch (err) {
      toast.error(err.detail || err.message || 'Không thể xóa sinh viên khỏi lớp');
      return false;
    }
  };

  return {
    classStudents,
    allStudents,
    loading,
    assigning,
    loadStudents,
    handleAssignStudent,
    handleRemoveStudent,
  };
}
