import { h, useState, useEffect } from '../../../lib/react.js';
import { TeacherDashboard } from './TeacherDashboard.js';
import { TeacherClassWorkspace } from './TeacherClassWorkspace.js';
import { TeacherLabDetailPage } from './TeacherLabDetailPage.js';

export function TeacherPortal({
  activeLabId,
  labDetails,
  setActiveLabId,
  refreshLabs,
  refreshDetails,
  queue,
  handleReview,
  setE2eStatusText,
}) {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedLabId, setSelectedLabId] = useState(null);

  // If activeLabId changes and matches a lab, or if initially navigating
  useEffect(() => {
    if (activeLabId && !selectedLabId) {
      // If user had activeLabId selected
      setSelectedLabId(activeLabId);
    }
  }, [activeLabId]);

  // When a lab is selected, render the Dedicated Lab Detail Page
  if (selectedLabId) {
    return h(TeacherLabDetailPage, {
      labId: selectedLabId,
      classroom: selectedClassId ? { id: selectedClassId, name: `Lớp #${selectedClassId}` } : null,
      labDetails,
      queue,
      onBack: () => {
        setSelectedLabId(null);
        if (setActiveLabId) setActiveLabId(null);
      },
      onReview: handleReview,
      onLabUpdated: () => {
        if (refreshDetails) refreshDetails();
        if (refreshLabs) refreshLabs();
      },
      setE2eStatusText,
    });
  }

  // When a class is selected, render the Class Workspace (Overview, Announcements, Roster, Labs)
  if (selectedClassId) {
    return h(TeacherClassWorkspace, {
      classId: selectedClassId,
      onBack: () => setSelectedClassId(null),
      onSelectLab: (labId) => {
        setSelectedLabId(labId);
        if (setActiveLabId) setActiveLabId(labId);
      },
    });
  }

  // Default: Teacher Dashboard (Lists all classes assigned to this teacher)
  return h(TeacherDashboard, {
    onSelectClass: (classId) => setSelectedClassId(classId),
    queue,
    activeLabId,
    labDetails,
    onReview: handleReview,
    setE2eStatusText,
    onPublished: () => {
      if (refreshDetails) refreshDetails();
      if (refreshLabs) refreshLabs();
    },
  });
}
