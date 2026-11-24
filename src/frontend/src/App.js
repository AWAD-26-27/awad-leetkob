import { h, useState, useEffect } from './lib/react.js';
import { AuthProvider, useAuth } from './providers/AuthProvider.js';
import { ToastProvider, useToast } from './providers/ToastProvider.js';
import { OfflineBanner, ErrorBoundary } from './components/ui/index.js';
import { Navbar, UserSelectorBar, LoginModal } from './features/auth/index.js';
import { useLabs } from './features/labs/index.js';
import { submitCode, listSubmissions, useAutoPollSubmission } from './features/submissions/index.js';
import { useReviewQueue } from './features/reviews/index.js';
import { AppRoutes, useHashRouter } from './routes/index.js';

function AppContent() {
  const { user, switchUser } = useAuth();
  const { toast } = useToast();
  const [e2eStatusText, setE2eStatusText] = useState('');
  const [activeSubId, setActiveSubId] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Client-side Hash Router
  const { path: routePath, params: routeParams, navigate: navigateTo } = useHashRouter();

  // Labs data & actions
  const { labs, activeLabId, setActiveLabId, labDetails, refreshLabs, refreshDetails } = useLabs();

  // Synchronize route lab parameter with activeLabId
  useEffect(() => {
    if (routePath === '/labs/:labId' && routeParams.labId) {
      if (routeParams.labId !== activeLabId) {
        setActiveLabId(routeParams.labId);
      }
    }
  }, [routePath, routeParams.labId]);

  // Synchronize activeLabId with route hash when on labs page
  useEffect(() => {
    if (activeLabId && (routePath === '/' || routePath === '/labs')) {
      if (user.role !== 'guest' && user.role !== 'admin') {
        navigateTo(`#/labs/${activeLabId}`);
      }
    }
  }, [activeLabId]);

  // Trigger login modal if route is #/login and user is not authenticated
  useEffect(() => {
    if (routePath === '/login' && (!user || user.role === 'guest')) {
      setShowLoginModal(true);
    }
  }, [routePath, user]);

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
    setActiveSubId(null);
    if (isStudent && activeLabId && user.id) {
      setSubmissionsList([]);
      listSubmissions(activeLabId)
        .then((data) => {
          if (data?.items) setSubmissionsList(data.items);
        })
        .catch(() => {});
    } else {
      setSubmissionsList([]);
    }
  }, [isStudent, activeLabId, user.username, user.id]);

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
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '28px 24px',
        },
      },
      // Status message element (strictly satisfies Playwright CI getByRole('status') & #status)
      h(
        'p',
        {
          id: 'status',
          role: 'status',
          style: {
            fontSize: '15px',
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
        routePath,
        routeParams,
        navigateTo,
      }),
    ),

    // Landing Login Modal
    h(LoginModal, {
      isOpen: showLoginModal,
      onClose: () => {
        setShowLoginModal(false);
        if (routePath === '/login') navigateTo('#/');
      },
    }),

    // Professional Academic & Modern Footer
    h(
      'footer',
      {
        style: {
          padding: '20px 32px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          color: '#64748b',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { style: { fontWeight: '700', color: '#0f172a' } }, 'LeeTKOB'),
        h('span', { style: { color: '#cbd5e1' } }, '—'),
        h('span', null, 'Nền tảng thực hành & thẩm định bài tập C++'),
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' } },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          h('span', {
            style: {
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
            },
          }),
          h('span', { style: { fontWeight: '600', color: '#059669', fontSize: '13px' } }, 'Hệ thống hoạt động'),
        ),
        h('span', { style: { color: '#cbd5e1' } }, '•'),
        h('span', { style: { fontSize: '12.5px', color: '#94a3b8' } }, 'AWAD 2609 • Node.js & C++20'),
      ),
    ),
  );
}

export function App() {
  return h(
    ErrorBoundary,
    null,
    h(AuthProvider, null, h(ToastProvider, null, h(OfflineBanner, null), h(AppContent, null))),
  );
}
export default App;
