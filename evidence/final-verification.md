# Final Integration & Secrets Verification Report

**Date:** 10 November 2026  
**Repository:** [AWAD-26-27/awad-leetkob](https://github.com/AWAD-26-27/awad-leetkob)  
**Evaluator:** Phạm Quốc Nam Anh (23120111)  
**Status:** All technical criteria and quality gates verified.

---

## 1. Environment & Test Verification

- **Node.js Environment:** Node.js 22.x (compatible with Linux CI Node 22.23.4).
- **Execution Command:**
  ```sh
  node --test "test/contract/publish.contract.test.js" "test/unit/**/*.test.js"
  ```
- **Test Results:**
  - Contract tests: **12 / 12 passing** (100%)
    - `no token is 401 and publishes nothing` (pass)
    - `unknown token is 401 and publishes nothing` (pass)
    - `a lab that does not exist is 404` (pass)
    - `an invalid non-numeric lab id is 404 not-found` (pass)
    - `a student of the class is 403 and publishes nothing` (pass)
    - `a TA of another class gets identical 404 body as non-existent lab` (pass)
    - `it refuses while reviews are pending and publishes nothing` (pass)
    - `the TA of the class publishes a lab with no pending review` (pass)
    - `an unexpected request body is ignored on publish` (pass)
    - `an admin may publish` (pass)
    - `publishing again is safe and does not move the time (idempotent retry)` (pass)
    - `internal server error returns 500 problem details` (pass)
  - Unit tests: **5 / 5 passing** (100%)
    - `no violation keeps the full mark` (pass)
    - `an upheld violation takes off what the TA declared` (pass)
    - `an overturned violation takes off nothing` (pass)
    - `the mark never goes below 0` (pass)
    - `violation and unsure need review; pass does not` (pass)
  - **Total Automated Tests:** **17 / 17 passing**, 0 failed, 0 cancelled, 0 skipped. Execution time: ~1.5 seconds.

---

## 2. Secrets & Git Repository Hygiene

- **`.gitignore` Enforcement:**
  - `git check-ignore -v .env` confirms `.env` is matched and ignored by `.gitignore:2:.env`.
  - `.env.example` is tracked without secret values (all keys blank).
- **Git Tracking Verification:**
  - `git ls-files --stage .env` returned 0 entries (file is never tracked).
  - `git log --all --full-history -- .env` returned 0 commits (zero history leakage).
- **Static Secrets Scanning:**
  - Gitleaks scan run across all refs and full history: **0 leaks detected**.
  - Local model credential is kept strictly inside untracked local `.env` and never included in Git commits or submission archives.
- **Model Spending Limit:**
  - Effective paid cap: **USD 0** via Google AI Studio Free Tier (no billing account linked).
  - Provisioned key is verified via read-only model discovery (`GET /v1beta/models`, HTTP 200).
  - CI and automated tests do not invoke external model endpoints.

---

## 3. CI Gate & Branch Protection Verification

- **Branch Protection / Ruleset:**
  - GitHub Ruleset `26915632` active on `refs/heads/main`.
  - Enforces Pull Request before merge.
  - Required checks: `gates` (lint, format, unit, contract) and `e2e` (browser journey).
  - Bypass list: Empty (0 bypass actors, including admins).
  - Direct force-push to `main` is blocked.
- **Deliberate Contract Break Evidence:**
  - PR [#5](https://github.com/AWAD-26-27/awad-leetkob/pull/5) (branch `evidence/break-publish-contract`, commit `cc6df3a`) deliberately bypassed the pending review guard.
  - Required check `gates` failed on assertion `200 !== 409`.
  - Branch protection blocked merge (Merge button disabled).
  - PR #5 was closed unmerged to preserve the clean state of `main`.
  - Evidence screenshot: `evidence/deliberate-contract-break-blocked.png`.

---

## 4. Submission Readiness

| Check Item | Status | Note |
|---|---|---|
| Engineering Harness & Rules (`AGENTS.md`) | Verified | 4 sections, covers incidents |
| Permissions & Secrets (`docs/permissions.md`) | Verified | 3-tier matrix, USD 0 spending limit |
| Checks Local & CI (`README.md`, `ci.yml`) | Verified | `npm run check`, Node 22 |
| Blocking CI Gate (`main` ruleset) | Verified | Required checks `gates`, `e2e` |
| Endpoint Contract (`docs/contract/publish.md`) | Verified | IA#3 format, 5 sections |
| Hardened Contract Tests (12 tests) | Verified | Swallowed assertions removed |
| Deliberate Contract Break (PR #5) | Verified | CI caught break, merge blocked |
| AI Use Log (`AI-LOG.md`) | Verified | All 3 members recorded |
| Self-Assessment (`SELF_ASSESSMENT_REPORT.md`) | Verified | 7 criteria mapped to evidence |
| Submission Dossier (`PA2.md`) | Verified | Ready for final tag `pa2` |
