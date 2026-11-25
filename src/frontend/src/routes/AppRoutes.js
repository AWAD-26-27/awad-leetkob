import { h } from '../lib/react.js';
import { Callout } from '../components/feedback/index.js';
import { Button } from '../components/ui/index.js';
import { AdminDashboard } from '../features/admin/index.js';
import { TeacherPortal } from '../features/teacher/index.js';
import { StudentPortal } from '../features/student/index.js';
import { StudentClassroomBanner } from '../features/classes/index.js';
import { LabSelector, LabDetailsCard } from '../features/labs/index.js';
import {
  CodeEditorWindow,
  SubmissionStepper,
  StudentSubmissionsTable,
} from '../features/submissions/index.js';
import { LandingPage } from './LandingPage.js';

export function AppRoutes({
  user,
  labs,
  activeLabId,
  labDetails,
  labDetailError,
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
  onOpenLogin,
  onQuickLogin,
  navigateTo = () => {},
}) {
  const isGuest = !user || user.role === 'guest';
  const isAdmin = user && user.role === 'admin';
  const isTeacher = user && user.role === 'ta';
  const isStudent = user && user.role === 'student';

  // Default to Landing Page if unauthenticated/guest
  if (isGuest) {
    return h(LandingPage, { onOpenLogin, onQuickLogin });
  }

  // Admin view is dedicated strictly to Admin Portal (Class & User management)
  // Admin has NO permission to manage labs or view class labs.
  if (isAdmin) {
    // Key by user.id ensures full remount on account switch — clears all stale state
    return h(AdminDashboard, { key: user.id });
  }

  if (labDetailError?.status === 404 || labDetailError?.status === 403) {
    const title =
      labDetailError.status === 404
        ? '404 — Không tìm thấy bài thực hành'
        : '403 — Truy cập bị từ chối';
    return h(
      Callout,
      { variant: 'danger', title },
      h('p', null, 'Bài thực hành này không khả dụng với tài khoản hiện tại.'),
      h(
        Button,
        {
          variant: 'outline',
          onClick: () => {
            setActiveLabId(null);
            navigateTo('#/classes');
          },
        },
        'Về danh sách lớp',
      ),
    );
  }

  // Teacher Portal: Multi-class management, announcements, roster, labs, and lab detail grades
  if (isTeacher) {
    // Key by user.id ensures full remount on account switch — clears all stale state
    return h(TeacherPortal, {
      key: user.id,
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
      setE2eStatusText,
    });
  }

  // Student Portal: Multi-class directory, class workspace, labs, and submission history without code
  if (isStudent) {
    // Key by user.id ensures full remount on account switch — clears all stale state
    return h(StudentPortal, {
      key: user.id,
      user,
      activeLabId,
      setActiveLabId,
      labDetails,
      activeSub,
      submissionsList,
      submittingCode,
      handleCodeSubmit,
      refreshDetails,
      refreshLabs,
    });
  }

  // Cross-class Isolation Guard
  const isClassMismatch =
    labDetails && user.classId && Number(labDetails.classId) !== Number(user.classId);

  if (isClassMismatch) {
    return h(
      Callout,
      { type: 'danger', title: '404 Not Found' },
      'You do not have access to this laboratory assignment from another class.',
    );
  }

  // Filter published labs for students
  const studentLabs = (labs || []).filter((l) => Boolean(l.publishedAt));

  return h(
    'div',
    null,
    user.classId && h(StudentClassroomBanner, { classId: user.classId }),

    h(LabSelector, {
      labs: studentLabs,
      activeLabId,
      onSelectLab: (id) => {
        setActiveLabId(id);
        if (navigateTo) navigateTo(`#/labs/${id}`);
      },
    }),

    h(LabDetailsCard, {
      lab: labDetails,
      onPublished: () => {
        refreshDetails();
        refreshQueue();
      },
      onLabUpdated: () => {
        refreshDetails();
        refreshLabs();
      },
      setE2eStatusText,
    }),

    h(
      'div',
      null,
      activeSub && h(SubmissionStepper, { submission: activeSub }),
      h(CodeEditorWindow, {
        labId: activeLabId,
        onSubmit: handleCodeSubmit,
        submitting: submittingCode,
      }),
      h(StudentSubmissionsTable, { submissions: submissionsList }),
    ),
  );
}
