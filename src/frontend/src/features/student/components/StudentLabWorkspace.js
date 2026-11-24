import { h } from '../../../lib/react.js';
import { Button } from '../../../components/ui/index.js';
import { LabDetailsCard } from '../../labs/index.js';
import {
  CodeEditorWindow,
  SubmissionStepper,
  StudentSubmissionsTable,
} from '../../submissions/index.js';

export function StudentLabWorkspace({
  lab,
  labDetails,
  onBackToList,
  activeSub,
  submissionsList,
  submittingCode,
  handleCodeSubmit,
  refreshDetails,
  refreshLabs,
}) {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    // Top Bar: Back button & Lab title
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '12px 18px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '10px',
        },
      },
      h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: onBackToList,
          style: { fontSize: '13px', padding: '5px 12px' },
        },
        '← Trở về danh sách bài lab',
      ),
      h(
        'div',
        { style: { fontSize: '15px', fontWeight: '700', color: '#0f172a' } },
        lab?.title || (labDetails?.title ? labDetails.title : `Lab #${lab?.id}`),
      ),
      lab?.publishedAt &&
        h(
          'span',
          {
            style: {
              fontSize: '11.5px',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontWeight: '600',
              border: '1px solid #a7f3d0',
            },
          },
          '✓ Đã công bố điểm',
        ),
    ),

    // 1. Lab Statement, Constraints & Tests
    labDetails &&
      h(LabDetailsCard, {
        lab: labDetails,
        onPublished: () => refreshDetails && refreshDetails(),
        onLabUpdated: () => {
          if (refreshDetails) refreshDetails();
          if (refreshLabs) refreshLabs();
        },
      }),

    // 2. Editor & Submissions for this Lab
    h(
      'div',
      null,
      activeSub && h(SubmissionStepper, { submission: activeSub }),
      h(CodeEditorWindow, {
        labId: lab?.id,
        onSubmit: handleCodeSubmit,
        submitting: submittingCode,
      }),
      h(StudentSubmissionsTable, { submissions: submissionsList }),
    ),
  );
}
