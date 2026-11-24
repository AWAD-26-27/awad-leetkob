# Frontend Architecture Specification (React / Feature-Driven)

This document defines the mandatory frontend architecture for LeeTKOB, modeled after [Shpendrr/react-app-structure](https://github.com/Shpendrr/react-app-structure) (Bulletproof React).

> **Nguyên tắc thiết kế:**  
> Dự án áp dụng mô hình Feature-Driven Modularity. Mã nguồn được tổ chức theo module chức năng độc lập, phân tách rõ ràng trách nhiệm giữa UI, Hook và API, đảm bảo khả năng mở rộng và bảo trì lâu dài.  
> 
> **Mẫu chuẩn tham chiếu:** `src/frontend/src/features/auth/` là cấu trúc tham chiếu chuẩn cho tất cả các feature khác trong hệ thống.

---

## 1. Directory Tree & Responsibilities

The frontend resides in `src/frontend/` and follows this exact structure:

```text
src/frontend/
├── README.md               # Overview of frontend architecture and setup
├── src/
│   ├── assets/             # Static global assets (SVG icons, logos, static illustrations)
│   ├── components/         # Shared, domain-agnostic UI primitives (NO business logic)
│   │   ├── ui/             # Button, Input, Modal, Badge, Card, Textarea, Stepper, Table
│   │   ├── feedback/       # Callout, EmptyState, Spinner
│   │   └── index.js        # Barrel export for shared components
│   ├── config/             # App-wide constants, navigation config, theme tokens
│   │   ├── constants.js    # API URLs, roles, status enums
│   │   ├── theme.css       # Design system CSS variables & utilities
│   │   └── theme.js        # JS theme tokens
│   ├── features/           # Domain-driven feature modules
│   │   ├── admin/          # Admin user/class creation & system management
│   │   ├── auth/           # Authentication, session, login/logout, profile (REFERENCE)
│   │   ├── classes/        # Class management, student rosters, enrollment
│   │   ├── labs/           # Lab creation, lab selection, lab criteria
│   │   ├── reviews/        # TA review queue, constraint evaluation, publish
│   │   └── submissions/    # Student code editor, submission stepper, submission history
│   ├── hooks/              # Global, domain-agnostic custom React hooks (e.g. useDebounce)
│   ├── lib/                # Pre-configured library clients and runtime wrappers
│   │   ├── apiClient.js    # Centralized HTTP client (fetch wrapper with RFC 7807 handling)
│   │   └── react.js        # Core React runtime / VDOM exports (h, createElement, hooks)
│   ├── providers/          # Global React Context providers (AuthProvider, ToastProvider)
│   │   ├── AuthProvider.js
│   │   ├── ToastProvider.js
│   │   └── index.js
│   ├── routes/             # Top-level view layouts and route view routers
│   │   ├── AppRoutes.js    # Central view switcher / route renderer
│   │   └── index.js
│   ├── stores/             # Global client state (if needed beyond Context)
│   ├── types/              # Global type definitions / JSDoc shared interfaces
│   ├── utils/              # Pure utility functions (classNames, formatTime, errorParsers)
│   ├── App.js              # Root application layout shell
│   └── main.js             # Application bootstrap & DOM mount entry
```

---

## 2. Feature Module Anatomy (The 5-Part Pattern)

Every feature in `src/frontend/src/features/<feature-name>/` **must** strictly contain these 5 folders/files:

```text
features/<feature-name>/
├── api/
│   ├── <feature>Api.js     # Raw network request functions
│   └── index.js            # Re-exports all API methods
├── components/
│   ├── <SubComponent1>.js  # Isolated subcomponent (< 200 lines)
│   ├── <SubComponent2>.js  # Isolated subcomponent (< 200 lines)
│   └── index.js            # Re-exports feature components
├── hooks/
│   ├── use<Feature>.js     # Custom hooks managing data lifecycle, polling, UI logic
│   └── index.js            # Re-exports feature hooks
├── types/
│   └── index.js            # JSDoc @typedef contracts and constants
└── index.js                # PUBLIC GATEWAY (only exports what external modules need)
```

### Detailed Breakdown of Each Layer:

### 1. `types/index.js`
All domain contracts must be typed using JSDoc:
```javascript
/**
 * @typedef {Object} Lab
 * @property {string} id
 * @property {string} title
 * @property {string} deadline
 */
export const LAB_STATUS = { DRAFT: 'draft', PUBLISHED: 'published' };
```

### 2. `api/<feature>Api.js` & `api/index.js`
Contains pure API request functions calling `apiClient`. Never call `fetch()` directly in components.
```javascript
import { apiClient } from '../../../lib/apiClient.js';

export async function fetchLabs() {
  return apiClient.get('/api/labs');
}
```

### 3. `hooks/use<Feature>.js` & `hooks/index.js`
Encapsulates all asynchronous state, polling, filtering, and mutations:
```javascript
import { useState, useEffect } from '../../../lib/react.js';
import { fetchLabs } from '../api/index.js';

export function useLabs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  // ...
  return { labs, loading, refresh: fetchLabs };
}
```

### 4. `components/` & `components/index.js`
- **Subcomponent Deconstruction:** Break complex views into small, focused subcomponents.
- **Line Limit:** No single component file may exceed **200 lines of code**.
- **Internal Barrel:** `components/index.js` re-exports all components belonging to this feature.

### 5. `index.js` (Feature Root)
The public interface of the feature. External code (such as `routes/` or `App.js`) may **only** import from `features/<feature-name>`:
```javascript
// features/auth/index.js
export * from './components/index.js';
export * from './hooks/index.js';
export * from './types/index.js';
export * from './api/index.js';
```

---

## 3. Strict Boundary Rules

1. **Feature Encapsulation:**
   - ❌ **FORBIDDEN:** `import { StudentModal } from '../classes/components/StudentModal.js';`
   - ✅ **REQUIRED:** `import { StudentModal } from '../classes/index.js';`

2. **No Monolithic Dumps:**
   - Never write a 600+ line component (such as the legacy `AdminDashboard.js` or `ClassStudentRoster.js`).
   - Break screens down into:
     - Container/Layout component (< 100 lines)
     - Individual sub-tabs or sections (< 150 lines)
     - Modals and forms (< 150 lines)
     - Table rows or item cards (< 100 lines)

3. **Separation of Network Calls:**
   - Components **must never** perform HTTP calls directly.
   - Flow: **Component ➔ Custom Hook (or API module) ➔ `apiClient` ➔ Backend**.

---

## 4. Current State & Pending Migration Checklist

Use this checklist to bring remaining features into compliance with this standard:

- [x] **`features/auth/`**: Canonical reference implemented (`api/`, `components/`, `hooks/`, `types/`, `index.js`).
- [x] **`features/labs/`**:
  - [x] Add `features/labs/types/index.js` with JSDoc definitions.
  - [x] Add `features/labs/api/index.js`.
  - [x] Add `features/labs/components/index.js`.
  - [x] Decompose `CreateLabForm.js` and `LabDetailsCard.js` if over 200 lines.
- [x] **`features/submissions/`**:
  - [x] Add `features/submissions/types/index.js`.
  - [x] Add `features/submissions/api/index.js`.
  - [x] Add `features/submissions/components/index.js`.
  - [x] Decompose `CodeEditorWindow.js` and `StudentSubmissionsTable.js`.
- [x] **`features/reviews/`**:
  - [x] Add `features/reviews/types/index.js`.
  - [x] Add `features/reviews/api/index.js`.
  - [x] Add `features/reviews/components/index.js`.
  - [x] Decompose `ReviewQueueTable.js`.
- [x] **`features/admin/`**:
  - [x] Decompose monolithic 687-line `AdminDashboard.js` into subcomponents (`ClassManagementCard`, `ClassItemRow`, `UserCreationCard`, `UserDirectoryTable`, `AdminHeader`).
  - [x] Modern Enterprise SaaS Redesign: Removed gaming emojis and saturated dark gradients, replaced with a dedicated zero-dependency SVG icon system `AdminIcons.js`, clean subtle borders, and natural Vietnamese typography.
  - [x] Add `features/admin/api/`, `hooks/`, `types/`.
  - [x] Completely removed dangerous database reset features (`POST /api/admin/reset-database` and "Reset Database" UI button).
- [x] **`features/classes/`**:
  - [x] Decompose monolithic 320-line `ClassStudentRoster.js` into subcomponents (`AssignStudentForm`, `ClassStudentTable`, `ClassStudentRoster`).
  - [x] Add `features/classes/hooks/`, `types/`.
- [x] **`features/labs/`**:
  - [x] Add `features/labs/types/index.js` with JSDoc definitions.
  - [x] Add `features/labs/api/index.js`.
  - [x] Add `features/labs/components/index.js`.
  - [x] Added inline lab editing (title, statement) via `PUT /api/labs/:labId` in `LabDetailsCard.js` for assigned teachers.
  - [x] Decompose `CreateLabForm.js` and `LabDetailsCard.js` under 200 lines limit.
- [x] **`src/routes/`**:
  - [x] Create `src/routes/AppRoutes.js`, `GuestLandingCard.js`, and remove inline route switching from `App.js`.
  - [x] Role-based routing: Admin views dedicated SaaS Admin Dashboard; Teachers view Class Labs; unassigned teachers receive an alert callout banner directing them to contact Admin.
