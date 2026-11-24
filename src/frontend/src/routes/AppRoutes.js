import { h, useState } from '../lib/react.js';
import { Callout } from '../components/feedback/index.js';
import { AdminDashboard } from '../features/admin/index.js';
import { ClassStudentRoster } from '../features/classes/index.js';
import { LabSelector, CreateLabForm, LabDetailsCard } from '../features/labs/index.js';
import {
  CodeEditorWindow,
  SubmissionStepper,
  StudentSubmissionsTable,
} from '../features/submissions/index.js';
import { ReviewQueueTable } from '../features/reviews/index.js';
import { AdminModeBar } from './AdminModeBar.js';
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
}) {
  const [adminViewMode, setAdminViewMode] = useState('admin');
  const isGuest = !user || user.role === 'guest';
  const isAdmin = user && user.role === 'admin';
  const isTeacher = user && user.role === 'ta';
  const isStudent = user && user.role === 'student';

  // Default to Landing Page if unauthenticated/guest
  if (isGuest) {
    return h(LandingPage, { onOpenLogin, onQuickLogin });
  }

  // Cross-class Isolation Guard
  const isClassMismatch =
    !isAdmin &&
    labDetails &&
    user.classId &&
    labDetails.classId !== user.classId;

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
    isAdmin &&
      h(AdminModeBar, {
        adminViewMode,
        onSelectMode: (mode) => setAdminViewMode(mode),
      }),

    isAdmin && adminViewMode === 'admin'
      ? h(AdminDashboard, null)
      : h(
          'div',
          null,
          isTeacher &&
            h(ClassStudentRoster, {
              classId: user.classId,
              className: user.classId ? `Class ${user.classId}` : null,
            }),

          (isTeacher || (isAdmin && adminViewMode === 'labs')) &&
            h(CreateLabForm, { onSuccess: refreshLabs }),

          h(LabSelector, {
            labs,
            activeLabId,
            onSelectLab: (id) => setActiveLabId(id),
          }),

          h(LabDetailsCard, {
            lab: labDetails,
            onPublished: () => {
              refreshDetails();
              refreshQueue();
            },
            setE2eStatusText,
          }),

          isTeacher || (isAdmin && adminViewMode === 'labs')
            ? h(ReviewQueueTable, {
                queue,
                onReview: async (subId, constraintCode, decision) => {
                  await handleReview(subId, constraintCode, decision);
                  refreshQueue();
                },
                setE2eStatusText,
              })
            : isStudent
              ? !user.classId
                ? h(
                    Callout,
                    { type: 'warning', title: 'Chưa Ghi Danh Lớp Học' },
                    'Tài khoản Sinh viên của bạn chưa được phân vào lớp học nào. Vui lòng liên hệ Giảng viên hoặc Quản trị viên để được gán vào lớp học trước khi làm bài lab.',
                  )
                : h(
                    'div',
                    null,
                    activeSub && h(SubmissionStepper, { submission: activeSub }),
                    h(CodeEditorWindow, {
                      onSubmit: handleCodeSubmit,
                      submitting: submittingCode,
                    }),
                    h(StudentSubmissionsTable, { submissions: submissionsList }),
                  )
              : null,
        ),
  );
}
