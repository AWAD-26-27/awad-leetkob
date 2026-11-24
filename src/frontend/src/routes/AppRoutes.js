import { h } from '../lib/react.js';
import { Callout } from '../components/feedback/index.js';
import { AdminDashboard } from '../features/admin/index.js';
import { ClassStudentRoster, StudentClassroomBanner } from '../features/classes/index.js';
import { LabSelector, CreateLabForm, LabDetailsCard } from '../features/labs/index.js';
import {
  CodeEditorWindow,
  SubmissionStepper,
  StudentSubmissionsTable,
} from '../features/submissions/index.js';
import { ReviewQueueTable } from '../features/reviews/index.js';
import { LandingPage } from './LandingPage.js';

export function AppRoutes({
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
  onOpenLogin,
  onQuickLogin,
  routePath = '/',
  routeParams = {},
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
    return h(AdminDashboard, null);
  }

  // Teacher without an assigned class
  if (isTeacher && !user.classId) {
    return h(
      Callout,
      { type: 'warning', title: 'Chưa Phân Công Lớp Học' },
      'Tài khoản Giảng viên của bạn chưa được phân công phụ trách lớp học nào. Vui lòng liên hệ Quản trị viên để được phân công vào lớp học trước khi tạo hoặc quản lý bài thực hành (Labs).',
    );
  }

  // Student without an assigned class
  if (isStudent && !user.classId) {
    return h(
      Callout,
      { type: 'warning', title: 'Chưa Ghi Danh Lớp Học' },
      'Tài khoản Sinh viên của bạn chưa được phân vào lớp học nào. Vui lòng liên hệ Giảng viên hoặc Quản trị viên để được gán vào lớp học trước khi làm bài lab.',
    );
  }

  // Cross-class Isolation Guard
  const isClassMismatch =
    labDetails &&
    user.classId &&
    Number(labDetails.classId) !== Number(user.classId);

  if (isClassMismatch) {
    return h(
      Callout,
      { type: 'danger', title: '404 Not Found' },
      'You do not have access to this laboratory assignment from another class.',
    );
  }

  return h(
    'div',
    null,
    isTeacher &&
      h(ClassStudentRoster, {
        classId: user.classId,
        className: user.className || (user.classId ? `Class ${user.classId}` : null),
        onRosterChange: refreshLabs,
      }),

    isTeacher && h(CreateLabForm, { onSuccess: refreshLabs }),

    isStudent &&
      user.classId &&
      h(StudentClassroomBanner, { classId: user.classId }),

    h(LabSelector, {
      labs,
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

    isTeacher
      ? h(ReviewQueueTable, {
          queue,
          onReview: async (subId, constraintCode, decision) => {
            await handleReview(subId, constraintCode, decision);
            refreshQueue();
          },
          setE2eStatusText,
        })
      : isStudent
        ? h(
            'div',
            null,
            activeSub && h(SubmissionStepper, { submission: activeSub }),
            h(CodeEditorWindow, {
              labId: activeLabId,
              onSubmit: handleCodeSubmit,
              submitting: submittingCode,
            }),
            h(StudentSubmissionsTable, { submissions: submissionsList }),
          )
        : null,
  );
}
