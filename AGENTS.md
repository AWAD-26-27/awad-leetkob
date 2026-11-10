# LeeTKOB assistant rules

## Stack

- PA#2 slice: JavaScript ES modules, Node.js 22.13+, built-in HTTP and SQLite in memory; plain HTML UI.
- ESLint, Prettier, `node:test`, Playwright. Demo has no LLM pipeline or C++ sandbox; Gemini access is provisioned separately for PA#3.

## Commands

- Install: `npm ci`; demo: `npm start` (port 3007).
- Lint: `npm run lint`; format check: `npm run format:check`.
- Unit tests: `npm test`; contract tests: `npm run contract`.
- Required quality gate: `npm run check` (same command in CI).
- Browser: `npx playwright install chromium`, then `npm run e2e`; CI installs with `--with-deps`.
- No separate type checker is configured for this plain JavaScript project. Do not claim ESLint performs type checking.
- Manual provider setup only: `node --env-file=.env scripts/model-smoke.js` sends synthetic text; never add this to tests or CI. See [USD 0 billing boundary](docs/model-budget.md).

## Conventions

- Follow [permissions](docs/permissions.md) and [task ownership](PHAN_CONG_PA2.md). State scope and verification before editing; keep changes focused.
- Use a branch from current main and a PR; main requires `gates` and `e2e`. Preserve every member's entries when merging AI-LOG.md.
- Read [Publish's contract](docs/contract/publish.md) before changing its behavior. Check role/ownership and pending reviews before writes; refused calls leave data unchanged. Publish retries keep the original timestamp.
- Contract/test hardening belongs in a separate commit before the implementation fix. An assigned deliberate-break PR changes implementation only, keeps tests/contract intact, records failing CI and must never merge.
- Record actual tool use, Changed / Rejected decisions, checks and evidence in AI-LOG.md. Keep source files LF, two-space indentation and single quotes.

## Never

- Never hide check failures with `continue-on-error`, `|| true` or equivalent. The original workflow concealed `legacyLimit`; see [the CI incident](AI-LOG.md#incident-ci-hidden-failures) and commit `eba0b2a`.
- Never catch and discard a test assertion. The pending-review test reported pass on HTTP 200 instead of 409; see [the contract incident](AI-LOG.md#incident-swallowed-assertion).
- Never weaken tests, eval data, labels or thresholds just to turn a check green. Fix the implementation; explicitly assigned test hardening and isolated break evidence follow the convention above.
- Never put real keys, credentials or student data in Git, logs or screenshots. No secret may enter the C++ sandbox, including through environment variables, mounts or the Docker socket.
- Never call a real model in unit/contract tests. Use deterministic fixtures. Never let a model choose deductions or bypass TA review/Publish; future model input must strip comments and student identity, validate exact evidence lines, and turn timeout/invalid evidence into `unsure`.
- Never fabricate evidence, approval, spending caps, human edits or self-assessment scores. Never bypass branch rules or push directly to main.
