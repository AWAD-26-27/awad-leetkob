// Backward compatibility wrapper for Luồng 2 (Worker) & legacy tests
import { open } from './backend/db.js';
export * from './backend/db.js';
export { open };
export default { open };
