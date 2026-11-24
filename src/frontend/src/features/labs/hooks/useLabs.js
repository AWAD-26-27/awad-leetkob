import { useState, useEffect, useCallback } from '../../../lib/react.js';
import { fetchLabs, fetchLab } from '../api/labsApi.js';
import { useAuth } from '../../../providers/AuthProvider.js';

export function useLabs() {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [activeLabId, setActiveLabId] = useState(null);
  const [labDetails, setLabDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLabs();
      const list = data?.items || [];
      setLabs(list);
      if (list.length > 0) {
        if (!activeLabId || !list.some((l) => l.id === activeLabId)) {
          setActiveLabId(list[0].id);
        }
      } else {
        setActiveLabId(null);
        setLabDetails(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch labs');
      setLabs([]);
      setActiveLabId(null);
      setLabDetails(null);
    } finally {
      setLoading(false);
    }
  }, [user.username, user.classId, activeLabId]);

  const loadLabDetails = useCallback(async (id) => {
    if (!id) {
      setLabDetails(null);
      return;
    }
    try {
      const details = await fetchLab(id);
      setLabDetails(details);
    } catch (err) {
      console.error('Failed to load lab details:', err);
      setLabDetails(null);
    }
  }, []);

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  useEffect(() => {
    if (activeLabId) {
      loadLabDetails(activeLabId);
    }
  }, [activeLabId, loadLabDetails]);

  return {
    labs,
    activeLabId,
    setActiveLabId,
    labDetails,
    loading,
    error,
    refreshLabs: loadLabs,
    refreshDetails: () => loadLabDetails(activeLabId),
  };
}
