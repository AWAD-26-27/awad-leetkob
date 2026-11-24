import { h, useState, useEffect } from '../../../lib/react.js';
import { StudentDashboard } from './StudentDashboard.js';
import { StudentClassWorkspace } from './StudentClassWorkspace.js';

export function StudentPortal({
  activeLabId,
  setActiveLabId,
  labDetails,
  activeSub,
  submissionsList,
  submittingCode,
  handleCodeSubmit,
  refreshDetails,
  refreshLabs,
}) {
  const [selectedClassId, setSelectedClassId] = useState(null);

  // If labDetails has a classId and user enters via lab URL directly
  useEffect(() => {
    if (labDetails?.classId && !selectedClassId) {
      setSelectedClassId(Number(labDetails.classId));
    }
  }, [labDetails]);

  if (selectedClassId) {
    return h(StudentClassWorkspace, {
      classId: selectedClassId,
      onBack: () => setSelectedClassId(null),
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

  return h(StudentDashboard, {
    onSelectClass: (classId) => setSelectedClassId(classId),
  });
}
