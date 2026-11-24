# Frontend Architecture

This folder contains the frontend application organized following a modular, feature-based architecture (Bulletproof React pattern).

For detailed architecture specifications and team coding guidelines, see:
- **[Frontend Architecture Specification](../../docs/frontend-architecture.md)**
- **[Coding Guidelines & Standards](../../docs/agent-coding-guidelines.md)**

---

## Directory Overview

```text
src/frontend/
├── README.md               # Frontend documentation & guide
└── src/
    ├── assets/             # Global static assets (SVGs, logos, icons)
    ├── components/         # Shared, generic UI primitives (stateless, 0% domain logic)
    │   ├── ui/             # Button, Input, Modal, Badge, Card, Textarea
    │   ├── feedback/       # Callout, EmptyState, Spinner
    │   └── index.js        # Re-export of shared UI primitives
    ├── config/             # Application constants, theme definitions, and tokens
    ├── features/           # Feature-based domain modules (Strict 5-Part Pattern)
    │   ├── admin/          # Admin user/class management & system oversight
    │   │   ├── api/        # Admin API endpoints
    │   │   ├── components/ # Admin UI subcomponents (< 200 lines each)
    │   │   ├── hooks/      # Admin custom hooks (useAdminData)
    │   │   ├── types/      # JSDoc type definitions
    │   │   └── index.js    # Public gateway
    │   ├── auth/           # Authentication, session, login/logout, profile (REFERENCE)
    │   │   ├── api/        # Auth API endpoints
    │   │   ├── components/ # Modals, Navbar, UserSelector
    │   │   ├── hooks/      # Auth state hooks (useCurrentUser)
    │   │   ├── types/      # JSDoc User/Role definitions
    │   │   └── index.js    # Public gateway
    │   ├── classes/        # Class management, student rosters, enrollment
    │   │   ├── api/        # Class/student API endpoints
    │   │   ├── components/ # Roster, assign form, student table
    │   │   ├── hooks/      # Class hooks (useClassStudents)
    │   │   ├── types/      # JSDoc class definitions
    │   │   └── index.js    # Public gateway
    │   ├── labs/           # Lab creation, selector, details, publish
    │   │   ├── api/        # Lab API endpoints
    │   │   ├── components/ # CreateLabForm, LabDetailsCard, selectors
    │   │   ├── hooks/      # Lab state hooks (useLabs)
    │   │   ├── types/      # JSDoc lab definitions
    │   │   └── index.js    # Public gateway
    │   ├── submissions/    # Student solution submission, editor, stepper, history
    │   │   ├── api/        # Submission API endpoints
    │   │   ├── components/ # CodeEditorWindow, SubmissionStepper, SubmissionsTable
    │   │   ├── hooks/      # Polling hooks (useAutoPollSubmission)
    │   │   ├── types/      # JSDoc submission definitions
    │   │   └── index.js    # Public gateway
    │   └── reviews/        # TA review queue, constraint evaluation, publish
    │       ├── api/        # Review API endpoints
    │       ├── components/ # ReviewQueueTable, ReviewQueueItem, metrics
    │       ├── hooks/      # Queue hooks (useReviewQueue)
    │       ├── types/      # JSDoc review definitions
    │       └── index.js    # Public gateway
    ├── hooks/              # Global custom React hooks (e.g. useDebounce)
    ├── lib/                # Pre-configured library wrappers (apiClient, react runtime)
    ├── providers/          # Global React Context providers (AuthProvider, ToastProvider)
    ├── routes/             # Top-level view layouts and route orchestrator
    ├── stores/             # Global client state (if needed)
    ├── types/              # Shared data contracts and JSDoc schemas
    ├── utils/              # Helper utilities (formatTime, classNames)
    ├── App.js              # Application shell
    └── main.js             # Bootstrap & DOM mounting
```

---

## Development Guidelines

1. **Colocate by Feature:** Keep everything specific to a feature inside `src/features/<feature-name>/`.
2. **Strict Module Encapsulation:** Only import from other features through their public entry point (`index.js`). Never use deep internal cross-feature imports.
3. **Component Decomposition:** Keep individual components focused and concise (under **200 lines** per file).
4. **Isolate API Requests:** Keep network calls in `api/<feature>Api.js`. Never invoke raw `fetch()` directly inside component render blocks.
