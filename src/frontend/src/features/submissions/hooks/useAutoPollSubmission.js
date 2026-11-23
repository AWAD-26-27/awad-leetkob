import { useState, useEffect, useRef } from '../../../lib/react.js';
import { getSubmissionStatus } from '../api/submissionsApi.js';

export function useAutoPollSubmission(initialSubmissionId, onStatusChange) {
  const [submissionId, setSubmissionId] = useState(initialSubmissionId);
  const [submission, setSubmission] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollError, setPollError] = useState(null);
  const timerRef = useRef(null);

  const startPolling = (subId) => {
    setSubmissionId(subId);
  };

  useEffect(() => {
    if (!submissionId) {
      setSubmission(null);
      setIsPolling(false);
      return;
    }

    let active = true;

    async function poll() {
      try {
        const data = await getSubmissionStatus(submissionId);
        if (!active) return;
        setSubmission(data);
        if (onStatusChange) onStatusChange(data);

        // If judged or error, terminate polling immediately
        if (data.status === 'judged' || data.status === 'error') {
          setIsPolling(false);
          return;
        }

        // Otherwise keep polling every 3000ms
        setIsPolling(true);
        timerRef.current = setTimeout(poll, 3000);
      } catch (err) {
        if (!active) return;
        setPollError(err.message || 'Polling error');
        setIsPolling(false);
      }
    }

    poll();

    return () => {
      active = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [submissionId]);

  return {
    submission,
    isPolling,
    pollError,
    startPolling,
  };
}
