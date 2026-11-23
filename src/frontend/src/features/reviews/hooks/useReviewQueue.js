import { useState, useEffect, useCallback } from '../../../lib/react.js';
import { fetchReviewQueue, reviewConstraint, reviewSubmissionLegacy } from '../api/reviewsApi.js';
import { useAuth } from '../../../providers/AuthProvider.js';

export function useReviewQueue(labId) {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadQueue = useCallback(async () => {
    if (!labId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviewQueue(labId);
      setQueue(data?.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch review queue');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, [labId, user.username]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleReview = async (submissionId, constraintCode, decision) => {
    try {
      if (constraintCode) {
        await reviewConstraint(submissionId, constraintCode, decision);
      } else {
        await reviewSubmissionLegacy(submissionId, decision);
      }
      await loadQueue();
      return true;
    } catch (err) {
      console.error('Failed to review:', err);
      throw err;
    }
  };

  return {
    queue,
    loading,
    error,
    refreshQueue: loadQueue,
    handleReview,
  };
}
