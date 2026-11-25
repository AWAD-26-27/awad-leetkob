import { useState, useEffect, useCallback, useRef } from '../../../lib/react.js';
import { fetchLabs, fetchLab } from '../api/labsApi.js';
import { useAuth } from '../../../providers/AuthProvider.js';

export function useLabs(routeLabId = null) {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [activeLabId, setActiveLabId] = useState(null);
  const [labDetails, setLabDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [labDetailError, setLabDetailError] = useState(null);
  const requestedLab = useRef(routeLabId);
  const detailRequest = useRef(0);
  requestedLab.current = routeLabId;

  const loadLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLabs();
      const list = data?.items || [];
      setLabs(list);
      if (requestedLab.current) {
        setActiveLabId(requestedLab.current);
      } else if (list.length > 0) {
        setActiveLabId((currentId) => {
          if (!currentId || !list.some((l) => l.id === currentId)) {
            return list[0].id;
          }
          return currentId;
        });
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
  }, [user.username, user.classId]);

  const loadLabDetails = useCallback(
    async (id) => {
      const request = ++detailRequest.current;
      setLabDetailError(null);
      if (!id) {
        setLabDetails(null);
        return;
      }
      try {
        const details = await fetchLab(id);
        if (request !== detailRequest.current) return;
        setLabDetails(details);
      } catch (err) {
        if (request !== detailRequest.current) return;
        setLabDetails(null);
        setLabDetailError({ labId: id, status: err.status });
      }
    },
    [user.username, user.role],
  );

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  useEffect(() => {
    loadLabDetails(activeLabId);
  }, [activeLabId, loadLabDetails]);

  return {
    labs,
    activeLabId,
    setActiveLabId,
    labDetails,
    labDetailError,
    loading,
    error,
    refreshLabs: loadLabs,
    refreshDetails: () => loadLabDetails(activeLabId),
  };
}
