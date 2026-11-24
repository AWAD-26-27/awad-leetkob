# Agent Coding Guidelines & Quality Gate

This document outlines the mandatory operating instructions and quality checklist for all AI agents (Antigravity, Cursor, Claude Code, GitHub Copilot, Codex) working on the LeeTKOB codebase.

---

## 1. Prime Directive: No Shortcuts & No Phantom Architecture

1. **Verify Before Claiming:**  
   Never claim that an architectural pattern (e.g., `Shpendrr/react-app-structure`) is implemented unless the files, directories, and module boundaries actually exist and are functional.
2. **No Deceptive Documentation:**  
   Do not write README files depicting an idealized directory tree (e.g. showing `types/`, `routes/`, `hooks/`) if those directories were not actually created in code.
3. **No Monolithic Dumps:**  
   Never implement an entire feature or screen in a single 500+ line file. Components exceeding **200 lines** must be actively decomposed into dedicated subcomponents before the task is marked complete.

---

## 2. Mandatory Rules for Frontend Development

When modifying or adding code in `src/frontend/`:

### A. Location & Folder Rules
- **Shared UI Primitives:** Place only generic, stateless UI elements in `src/components/ui/` (e.g. `Button.js`, `Input.js`, `Modal.js`) or `src/components/feedback/` (e.g. `Spinner.js`, `EmptyState.js`).
- **Feature Code:** Place all business-specific UI, data logic, and hooks inside `src/features/<feature-name>/`.
  - Every feature must have:
    - `api/<feature>Api.js` (isolated HTTP calls)
    - `components/` (subcomponents, each < 200 lines)
    - `hooks/` (feature hooks managing state/fetching)
    - `index.js` (public barrel export)
- **Top-Level Orchestration:** Top-level page views belong in `src/routes/` or feature route files, orchestrated through `App.js`. Do not write hundreds of lines of inline views inside `App.js`.

### B. Module Boundary & Import Rules
- **Cross-Feature Imports:** Feature A must **never** import from Feature B's internal files.
  - ❌ `import { X } from '../classes/components/X.js'`
  - ✅ `import { X } from '../classes'` (exported by `classes/index.js`)
- **API Call Isolation:** Never call `fetch()` or `apiClient` directly inside a component's render body or event handlers without going through an API module or custom hook.

### C. Design & Styling Rules
- **Design Tokens:** Always use CSS variables from `src/config/theme.css`. Never use inline arbitrary color hex codes or magic dimension numbers.
- **Accessibility:** All form inputs must have associated labels or `aria-label`. Interactive elements must have focus states and keyboard navigation support.

---

## 3. Mandatory Rules for Backend & Database Development

When modifying or adding code in `src/backend/` or `src/`:

1. **Feature Separation:** Keep the 3-layer subsystem architecture (`router.js`, `<feature>-controller.js`, `<feature>-model.js`).
2. **Tenant Isolation:** Enforce class and user boundary checks. Cross-class access must return RFC 7807 404 (Not Found) to avoid leaking the existence of resources.
3. **Transactions:** All multi-step database writes (such as submitting code or recording TA reviews) must use atomic SQLite transactions (`db.transaction()`).
4. **Secrets:** Never write API keys or real secrets into database seed files, tests, or documentation.

---

## 4. Agent Pre-Completion Checklist

Before reporting any task as done or committing changes, the agent **MUST** verify each item:

- [ ] **Directory check:** Do the files actually exist where the architecture specification says they belong?
- [ ] **File length check:** Are all component files under 200 lines? If not, have subcomponents been extracted?
- [ ] **Boundary check:** Are all cross-feature imports routing exclusively through the feature's `index.js`?
- [ ] **Quality gate check:** Does the code pass existing tests and lint checks without regressions?
- [ ] **Honest documentation:** Does `AI-LOG.md` accurately state what was actually changed, rejected, and validated?
