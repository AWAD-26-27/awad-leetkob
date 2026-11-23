import { h, useState, useEffect } from './lib/react.js';
import { AuthProvider, useAuth } from './providers/AuthProvider.js';
import { ToastProvider, useToast } from './providers/ToastProvider.js';
import { UserSelectorBar } from './features/auth/index.js';
import { LabSelector, CreateLabForm, LabDetailsCard, useLabs } from './features/labs/index.js';
import {
  CodeEditorWindow,
  SubmissionStepper,
  StudentSubmissionsTable,
  submitCode,
  listSubmissions,
  useAutoPollSubmission,
} from './features/submissions/index.js';
import { ReviewQueueTable, useReviewQueue } from './features/reviews/index.js';
import { Callout } from './components/feedback/index.js';

function AppContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [e2eStatusText, setE2eStatusText] = useState('');
  const [activeSubId, setActiveSubId] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submittingCode, setSubmittingCode] = useState(false);

  // Labs hook
  const { labs, activeLabId, setActiveLabId, labDetails, refreshLabs, refreshDetails } = useLabs();

  // Review queue hook (for TA/Admin)
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

  // Check cross-class isolation
  const isStudent = user.role === 'student';
  const isStaff = user.role === 'ta' || user.role === 'admin';
  const isClassMismatch =
    isStudent && labDetails && user.classId && labDetails.classId !== user.classId;

  // Load existing student submissions for this lab
  useEffect(() => {
    if (isStudent && activeLabId && user.id) {
      listSubmissions(activeLabId)
        .then((data) => {
          if (data?.items) {
            setSubmissionsList(data.items);
          }
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
    // Header & User Selector
    h(UserSelectorBar, null),

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

      // Cross-class Isolation Guard
      isClassMismatch
        ? h(
            Callout,
            {
              type: 'danger',
              title: '404 Not Found',
            },
            'You do not have access to this laboratory assignment from another class.',
          )
        : h(
            'div',
            null,
            // Staff Controls: Create Lab
            isStaff && h(CreateLabForm, { onSuccess: refreshLabs }),

            // Lab Selector Bar
            h(LabSelector, {
              labs,
              activeLabId,
              onSelectLab: (id) => setActiveLabId(id),
            }),

            // Lab Details Card (Statement, Constraints, and Publish Button)
            h(LabDetailsCard, {
              lab: labDetails,
              onPublished: () => {
                refreshDetails();
                refreshQueue();
              },
              setE2eStatusText,
            }),

            // Role-specific sections
            isStaff
              ? // TA / Admin View: Review Queue
                h(ReviewQueueTable, {
                  queue,
                  onReview: async (subId, constraintCode, decision) => {
                    await handleReview(subId, constraintCode, decision);
                    refreshQueue();
                  },
                  setE2eStatusText,
                })
              : isStudent
                ? // Student View: Code Editor, Progress Stepper, Submissions Table
                  h(
                    'div',
                    null,
                    activeSub && h(SubmissionStepper, { submission: activeSub }),
                    h(CodeEditorWindow, {
                      onSubmit: handleCodeSubmit,
                      submitting: submittingCode,
                    }),
                    h(StudentSubmissionsTable, { submissions: submissionsList }),
                  )
                : // Guest view prompt
                  h(
                    Callout,
                    { type: 'info', title: 'Welcome to LeeTKOB' },
                    'Please select an account in the top bar ("Signed in as") to start assessing or reviewing laboratory assignments.',
                  ),
          ),
    ),

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
