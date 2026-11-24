import { useState, useEffect } from '../../../lib/react.js';
import { fetchMyClass } from '../api/index.js';

export function useMyClass(classId) {
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMyClass = async () => {
    if (!classId) {
      setClassroom(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchMyClass();
      if (res?.class) {
        setClassroom(res.class);
      } else {
        setClassroom(null);
      }
    } catch {
      setClassroom(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyClass();
  }, [classId]);

  return {
    classroom,
    loading,
    refreshMyClass: loadMyClass,
  };
}
