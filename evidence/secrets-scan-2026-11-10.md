# Secrets scan - 10 November 2026

Scope: Nam Anh's `docs/pa2-harness` branch from main `55a5c3045a8f5396eda3b99862391ca79f90a052`, all fetched refs plus the working tree. Repeat after integration and before packaging.

Scanner: **Gitleaks 8.30.1**, default rules. The [official Windows x64 release](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1) was downloaded outside the repo and verified against its release checksums. Archive SHA-256: `d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e`.

Commands, run from the repository root with `gitleaks` pointing to that executable:

```sh
gitleaks git . --log-opts="--all --full-history" --redact=100 --no-banner --report-format json --report-path <outside-repo-history.json>
gitleaks dir . --redact=100 --no-banner --report-format json --report-path <outside-repo-tree.json>
```

Both returned **exit 0, no leaks found**; both JSON reports were empty arrays. The history scan reported 4 commits with diffs, about 92 KB (the fetched history contains 6 commits including merges); the tree scan covered about 82 KB. Redaction was enabled and no allowlist was added to silence a finding. Files ignored by Git and un-fetched remote history are outside the submitted-tree claim.

`git check-ignore --no-index` confirmed `.env`, `.env.local`, `.env.production`, `secrets/provider.json`, `private.pem`, `private.key`, `cert.p12` and `cert.pfx` match ignore rules. `.env.example` does not match an ignore rule. Every value in the example is empty.

Manual review: the `tok-*` literals in `src/db.js` and browser fixtures are seeded demo identities, not external provider credentials. Four existing evidence PNGs were visually reviewed. No real leaked credential was found, so no rotation is claimed. Scanner success is detection evidence, not proof against every possible secret format. Never include local `.env` files when packaging the ZIP.

## After provisioning the authorized local key

A later direct `gitleaks dir .` returned exit 1 with exactly one redacted finding: `generic-api-key` at `.env:2`. This was the newly provisioned local key, not a Git-tracked or published secret. It was not printed, allowlisted, committed or packaged; no rotation for a public leak is claimed.

For the submission-content scan, copy exactly the paths returned by `git ls-files --cached --others --exclude-standard` into an outside-repo snapshot, assert `.env` is absent, then run the same Gitleaks directory scan/default rules against that snapshot. This returned **exit 0, no leaks found**, about 96.9 KB. This separates an intentionally local credential from the public submitted tree without suppressing a scanner rule. The Git-history scan remains a separate required check. Repeat it on the committed branch and after final integration.
