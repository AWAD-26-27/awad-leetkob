# LeeTKOB - PA#2 harness and quality gate

CSC13114, class 2609-AWAD-23/3. LeeTKOB helps a TA review assignment constraints before publishing C++ lab marks. This repo implements a small review-queue/Publish demo and the PA#2 harness. See [PA2.md](PA2.md) for evidence and [PHAN_CONG_PA2.md](PHAN_CONG_PA2.md) for ownership.

## Stack and scope

JavaScript ES modules on Node.js **22.13+**, built-in `node:http` and `node:sqlite`, and a plain HTML UI. Checks use ESLint, Prettier, `node:test` and Playwright. CI uses Node 22; use Node 22 locally to match its major version. SQLite may emit an experimental-feature warning.

SQLite runs **in memory**, seeded at every startup and reset on restart. The public `tok-*` demo identities in `src/db.js` are fixtures, not production authentication. The C++ sandbox, submission judge and eval pipeline are future checkpoints. Gemini access is provisioned for PA#3; the demo does not yet call a model.

## Install and run

Requirements: Git, Node.js 22.13+ and npm. No database server, provider key or `.env` file is needed.

```sh
git -c core.autocrlf=false clone https://github.com/AWAD-26-27/awad-leetkob.git
cd awad-leetkob
git config --local core.autocrlf false
npm ci
npm start
```

Open [http://localhost:3007](http://localhost:3007), select TA `ta_a`, confirm or overturn the pending review, then press **Publish grades**. Stop with Ctrl+C. `core.autocrlf=false` preserves repository LF line endings on Windows for the same Prettier result as Linux CI.

[.env.example](.env.example) lists every application/test environment variable without values:

| Variable      | Used by                | Behavior when unset             |
| ------------- | ---------------------- | ------------------------------- |
| `PORT`        | `src/server.js`        | Listen on 3007                  |
| `CHROME_PATH` | `playwright.config.js` | Playwright's installed Chromium |

The app does not load `.env` automatically; set shell variables only if needed. The example also lists `GEMINI_API_KEY` and `GEMINI_MODEL`, used only by the explicitly manual model setup check below, not by the demo or CI. Do not import the blank example as configuration: an empty `PORT` means port 0. E2E starts its own server on port 3007; leave that port free.

## Checks: local and CI

After `npm ci`, run from the repository root:

| Check                  | One command            | CI                                             |
| ---------------------- | ---------------------- | ---------------------------------------------- |
| Lint                   | `npm run lint`         | Required `gates`, through `npm run check`      |
| Format                 | `npm run format:check` | Required `gates`, through `npm run check`      |
| Unit tests             | `npm test`             | Required `gates`, through `npm run check`      |
| Publish contract tests | `npm run contract`     | Required `gates`, through `npm run check`      |
| Combined gate          | `npm run check`        | Lint, format, unit, contract; stops on failure |
| Browser journey        | `npm run e2e`          | Separate required `e2e` job                    |

Type check: not applicable to this plain JavaScript configuration; no TypeScript or `checkJs` checker is configured. ESLint is not a type checker. No dummy success-only command is used.

For the browser check, install once with `npx playwright install chromium`, then run `npm run e2e`. Linux CI installs with `npx playwright install --with-deps chromium`. E2E is additional to the rubric's seven criteria, but this team has made it required.

[CI](.github/workflows/ci.yml) runs on PRs into main, pushes to main and tag `pa2`; both jobs use `npm ci`. Main's [active ruleset](https://github.com/AWAD-26-27/awad-leetkob/rules/26915632) requires a PR and successful `gates`/`e2e`, with no bypass actors. Changes enter main through PRs.

**Contract and test status (2026-11-10):** Following integration of PR #4 and PR #7, the Publish endpoint enforces strict authorization before mutating state, verifies that all reviews are resolved before publishing (returning `409 reviews-pending` with the pending count), and preserves idempotency on repeated calls. The automated suite runs 5 unit and 12 contract tests (17 tests total), with swallowed assertions removed and all 4xx invariants asserted. The earlier baseline defect has been resolved and verified; see [AI-LOG.md](AI-LOG.md) and [PA2.md](PA2.md).

## Assistant and secrets

Read [AGENTS.md](AGENTS.md) and [permissions](docs/permissions.md). Keep real credentials out of Git and untrusted execution, use fixtures in tests, and record actual AI changes/decisions in [AI-LOG.md](AI-LOG.md). `.env` variants, common private-key files and `secrets/` are ignored; `.env.example` is tracked. Scan the complete history before submission, including newly integrated branches.

## Model and budget

**Provider/model:** Google Gemini API, `gemini-3.8-flash` (selected for code reasoning; constraint-review quality must still be measured by the PA#3/4 eval).

**Paid spending limit: USD 0.** The dedicated **LeeTKOB PA2** project is **Free tier with no billing account linked**. Its server key inherits that project status. This is a no-paid-billing boundary, not a Google Cloud budget alert or a separately configured numeric paid-tier cap. Do not enable billing, prepay or automatic reload without team authorization. [Project evidence](evidence/gemini-free-tier-2026-11-10.jpg) and [setup record](docs/model-budget.md) document the verified state and limitations.

The demo still makes **zero model calls**, so current model API cost per demo lab is **USD 0**. Future calls to this model in free tier are free within provider quotas; an 80-submission model run has not been measured or validated. No paid fallback is configured. Free-tier data may be used to improve Google's products: use synthetic/public fixtures only during setup, and decide data handling before sending real student code.

The authorized key is stored only in ignored local `.env`. [.env.example](.env.example) contains variable names with empty values; obtain a separate key through the project owner rather than sharing one in Git/chat. This manual synthetic check uses Node's built-in fetch and sends no student data:

```sh
node --env-file=.env scripts/model-smoke.js
```

It verifies the exact configured model using a short `OK` request and never prints the key or provider error bodies. It is **not** part of unit/contract tests or CI and must stay separate from `npm run check`. A failed provider call must not be hidden or turned into a passing automated test. At setup, model listing returned HTTP 200 with this model, while generation returned 503 then timed out; inference availability remains unverified.

Codex assisted Nam Anh's harness work, as recorded in AI-LOG.md; it is separate from the product model. See [official Gemini billing](https://aistudio.google.com/docs/billing#projects-api-keys) and [pricing](https://aistudio.google.com/docs/pricing#gemini-3.8-flash), checked 10 November 2026.

## Submission

Due **11 November 2026, 22:00 (Asia/Saigon)**. [PA2.md](PA2.md) maps evidence and links; [SELF_ASSESSMENT_REPORT.md](SELF_ASSESSMENT_REPORT.md) follows the Classroom template claiming 100/100 points backed by reproducible evidence.

Tú creates and pushes tag `pa2` and confirms both CI jobs pass on the tag run. Nam Anh packages the final repository **including `.git`**, excluding dependencies, local secrets and test outputs, as `<ascending-student-IDs>_100.zip`. Its claimed total matches the report. One member submits from their student email.
