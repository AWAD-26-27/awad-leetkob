import { h, useState, useEffect } from './lib/react.js';
import { AuthProvider, useAuth } from './providers/AuthProvider.js';
import { ToastProvider, useToast } from './providers/ToastProvider.js';
import { Navbar, UserSelectorBar, LoginModal } from './features/auth/index.js';
import { useLabs } from './features/labs/index.js';
import { submitCode, listSubmissions, useAutoPollSubmission } from './features/submissions/index.js';
import { useReviewQueue } from './features/reviews/index.js';
import { AppRoutes } from './routes/index.js';

function AppContent() {
  const { user, switchUser } = useAuth();
  const { toast } = useToast();
  const [e2eStatusText, setE2eStatusText] = useState('');
  const [activeSubId, setActiveSubId] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Labs data & actions
  const { labs, activeLabId, setActiveLabId, labDetails, refreshLabs, refreshDetails } = useLabs();

  // Review queue hook
  const { queue, refreshQueue, handleReview } = useReviewQueue(activeLabId);

  // Auto-polling hook for live submission
  const { submission: activeSub, startPolling } = useAutoPollSubmission(
    activeSubId,
    (updatedSub) => {
      setSubmissionsList((prev) => {
        const idx = prev.findIndex((s) => s.id === updatedSub.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updatedSub };
          return next;
        }
        return [updatedSub, ...prev];
      });
    },
  );

  const isStudent = user.role === 'student';

  // Load existing student submissions for this lab
  useEffect(() => {
    if (isStudent && activeLabId && user.id) {
      listSubmissions(activeLabId)
        .then((data) => {
          if (data?.items) setSubmissionsList(data.items);
        })
        .catch(() => {});
    }
  }, [isStudent, activeLabId, user.username]);

  const handleCodeSubmit = async (code) => {
    if (!activeLabId) return;
    setSubmittingCode(true);
    try {
      const res = await submitCode(activeLabId, code);
      toast.success(`Submission #${res.id} queued successfully!`);
      const newSub = {
        id: res.id,
        labId: activeLabId,
        studentId: user.id,
        status: 'queued',
        judgeVerdict: null,
        createdAt: new Date().toISOString(),
      };
      setSubmissionsList((prev) => [newSub, ...prev]);
      setActiveSubId(res.id);
      startPolling(res.id);
    } catch (err) {
      toast.error(err.detail || err.message || 'Submission failed');
    } finally {
      setSubmittingCode(false);
    }
  };

  return h(
    'div',
    { style: { minHeight: '100vh', display: 'flex', flexDirection: 'column' } },
    // Header & Navigation Bar (Navbar / UserSelectorBar)
    h(Navbar || UserSelectorBar, { onOpenLogin: () => setShowLoginModal(true) }),

    // Main App Body
    h(
      'main',
      {
        style: {
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
        },
      },
      // Status message element (strictly satisfies Playwright CI getByRole('status') & #status)
      h(
        'p',
        {
          id: 'status',
          role: 'status',
          style: {
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-primary)',
            minHeight: '20px',
            marginBottom: '16px',
          },
        },
        e2eStatusText,
      ),

      // Route View Orchestrator
      h(AppRoutes, {
        user,
        labs,
        activeLabId,
        labDetails,
        setActiveLabId,
        refreshLabs,
        refreshDetails,
        queue,
        refreshQueue,
        handleReview,
        activeSub,
        submissionsList,
        submittingCode,
        handleCodeSubmit,
        setE2eStatusText,
        onOpenLogin: () => setShowLoginModal(true),
        onQuickLogin: switchUser,
      }),
    ),

    // Landing Login Modal
    h(LoginModal, {
      isOpen: showLoginModal,
      onClose: () => setShowLoginModal(false),
    }),

    // Modern SaaS Footer
    h(
      'footer',
      {
        style: {
          padding: '18px 24px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
          color: '#64748b',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { style: { color: '#10b981', fontWeight: '700' } }, '● System Operational'),
        h('span', null, '|'),
        h('span', null, 'SQLite WAL Mode Engine'),
        h('span', null, '|'),
        h('span', null, 'C++20 GCC Sandbox'),
      ),
      h('div', null, 'LeeTKOB Automated Code Quality Gate & Grading System'),
    ),
  );
}

export function App() {
  return h(AuthProvider, null, h(ToastProvider, null, h(AppContent, null)));
}
export default App;
