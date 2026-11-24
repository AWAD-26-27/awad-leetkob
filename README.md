# LeeTKOB — PA#3 Multi-Tenant C++ Autograder, AST Checker & Review Queue

CSC13114, class 2609-AWAD-23/3. LeeTKOB is a comprehensive autograding and assignment evaluation platform for C++20 programming coursework. It features multi-tenant class isolation, a Docker-based C++ execution sandbox, AST-based static constraint checking (Tree-sitter WASM), AI-assisted semantic verification (Gemini API), an asynchronous SQLite review queue worker, and an enterprise SaaS frontend.

See [PHAN_CONG_PA3.md](../PHAN_CONG_PA3.md) for team ownership and [PA3_HANDOFF.md](../PA3_HANDOFF.md) for architecture handoff specifications.

## Stack and Scope

- **Backend:** JavaScript ES modules on Node.js **22.13+**, built-in `node:http`, and `node:sqlite` in WAL mode.
- **Multi-Tenant RBAC:** Strict separation of duties between Administrator, Teachers (TAs), and Students. See [Role & Business Matrix](docs/role-business-matrix.md).
- **C++ Sandbox:** Containerized Docker sandbox (`sandbox/Dockerfile`) executing student C++ code with strict limits on CPU, memory (cgroups), wall-clock time, network isolation (`--network none`), and non-root execution.
- **AST Checker & Guardrails:** Tree-sitter WASM parser (`src/checker/cpp.js`) enforcing hard ban-rules, recursion checks, and sanitized LLM prompts with exact code evidence. See [Checker Guide](docs/checker.md).
- **Worker Pipeline:** Resilient background worker (`src/worker.js`) executing sandbox jobs, claiming SQLite leases atomically, handling process crash recovery, and falling back gracefully offline. See [Handoff Worker Guide](docs/handoff-worker.md).
- **Frontend Architecture:** Feature-driven modular frontend under `src/frontend/` following [docs/frontend-architecture.md](docs/frontend-architecture.md), featuring an enterprise SaaS Admin portal, SVG icon system, teacher lab editor, and student IDE.
- **API Documentation:** Interactive Scalar API Reference at `/api/docs` and OpenAPI 3.1.0 document at `/api/openapi.json`.

## Install and Run

Requirements: Git, Node.js 22.13+, npm, and Docker (for C++ sandbox execution). No database server, provider key, or `.env` file is required for local demo or tests.

```sh
git -c core.autocrlf=false clone https://github.com/AWAD-26-27/awad-leetkob.git
cd awad-leetkob
git config --local core.autocrlf false
npm ci
npm start
```

Open [http://localhost:3007](http://localhost:3007) in your browser:
- Log in as **Admin** (`admin` / `password123`) to manage classes and user accounts.
- Log in as **Teacher** (`ta_a` / `password123`) to author labs, review AST violations, and publish grades.
- Log in as **Student** (`student_1` / `password123`) to read lab assignments and submit C++ solutions.

`core.autocrlf=false` preserves repository LF line endings on Windows for consistent formatting across local and Linux CI environments.

### Environment Configuration

[.env.example](.env.example) lists application environment variables with default fallback behaviors:

| Variable      | Used by                | Behavior when unset             |
| ------------- | ---------------------- | ------------------------------- |
| `PORT`        | `src/backend/server.js`| Listen on 3007                  |
| `CHROME_PATH` | `playwright.config.js` | Playwright's installed Chromium |
| `DB_PATH`     | `src/backend/db.js`    | In-memory database `:memory:`   |

The application does not load `.env` automatically; set shell variables only when customizing defaults.

## Checks: Local and CI

After `npm ci`, run from the repository root:

| Check                  | One command            | CI                                             |
| ---------------------- | ---------------------- | ---------------------------------------------- |
| Lint                   | `npm run lint`         | Required `gates`, through `npm run check`      |
| Format check           | `npm run format:check` | Required `gates`, through `npm run check`      |
| Unit tests             | `npm test`             | Required `gates`, through `npm run check`      |
| Contract tests         | `npm run contract`     | Required `gates`, through `npm run check`      |
| Combined quality gate  | `npm run check`        | Lint, format, unit, contract; stops on failure |
| Browser E2E journey    | `npm run e2e`          | Required `e2e` job                             |

For browser testing, install Playwright Chromium once via `npx playwright install chromium`, then run `npm run e2e`.

[CI](.github/workflows/ci.yml) runs on PRs into `main`, pushes to `main`, and tags matching `pa3`; jobs use Node 22 on `ubuntu-latest`.

**Current Test Status:** The automated suite runs **59 unit tests** and **58 contract tests** (**117 automated tests passing 100%**). All RFC 7807 problem details, role boundaries, idempotent publish retries, and student privacy invariants are rigorously verified.

## Assistant and Security Rules

Read [AGENTS.md](AGENTS.md) and [permissions](docs/permissions.md). Keep real credentials out of Git and untrusted execution, use deterministic fixtures in tests, and record actual AI changes and decisions in [AI-LOG.md](AI-LOG.md). `.env` variants, common private-key files, and `secrets/` are ignored.

## Model and Budget

**Provider/model:** Google Gemini API, `gemini-3.8-flash`.

**Paid spending limit: USD 0.** The dedicated **LeeTKOB PA3** project is configured in **Free tier with no billing account linked**. Its server key inherits that project status. Automated unit and contract tests use deterministic mock fixtures and make zero external network or model calls. See [model/budget documentation](docs/model-budget.md).

## Submission

Due **25 November 2026, 22:00 (Asia/Saigon)**.
- Tú verifies CI jobs on the final tag `pa3`.
- The repository is packaged according to course requirements as `<ascending-student-IDs>_100.zip`.
