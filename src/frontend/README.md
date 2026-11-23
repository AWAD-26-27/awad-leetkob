# Frontend (React App)

This folder contains the React frontend application refactored following the architectural pattern from [Shpendrr/react-app-structure](https://github.com/Shpendrr/react-app-structure).

## Architecture Overview

```text
src/frontend/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── assets/             # Global assets (images, svg, fonts)
    ├── components/         # Shared, reusable UI components (Button, Modal, Table, etc.)
    ├── config/             # Application configuration & constants
    ├── features/           # Feature-based domain modules
    │   ├── auth/           # Authentication, demo user switcher, session
    │   │   ├── api/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── types/
    │   ├── labs/           # TA lab creation, lab selector, stats
    │   │   ├── api/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── types/
    │   ├── submissions/    # Student solution submission, code editor, stepper, history
    │   │   ├── api/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── types/
    │   └── reviews/        # TA review queue, constraint review (confirm/overturn), publish
    │       ├── api/
    │       ├── components/
    │       ├── hooks/
    │       └── types/
    ├── hooks/              # Shared custom React hooks
    ├── lib/                # Pre-configured library wrappers (axios / apiClient)
    ├── providers/          # Global React Context providers (AuthProvider, etc.)
    ├── routes/             # App routing and view layouts
    ├── stores/             # Global client state
    ├── types/              # Shared TypeScript definitions / interfaces
    └── utils/              # Helper and formatting utilities
```
