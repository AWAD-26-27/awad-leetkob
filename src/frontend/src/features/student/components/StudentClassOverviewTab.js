import { h } from '../../../lib/react.js';
import { StudentClassInfoTab } from './StudentClassInfoTab.js';

// Backward-compatible alias for StudentClassInfoTab
export function StudentClassOverviewTab(props) {
  return h(StudentClassInfoTab, props);
}
