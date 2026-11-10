# Assistant permissions

These tiers apply to LeeTKOB. A direct user instruction authorizing an operation satisfies its approval requirement; ask only for missing authority or information. File ownership is in [PHAN_CONG_PA2.md](../PHAN_CONG_PA2.md).

## Allowed

- Read the repository, brief, rubric and evidence; inspect GitHub PRs, CI logs and rulesets.
- Create a task branch, edit assigned files, install lockfile dependencies with `npm ci`, run checks and the local demo with seeded data.
- Strengthen contract assertions when assigned; record separate failing-test and implementation-fix commits.
- Run redacted secret scans of the tree and all fetched history; report locations/rules without secret values.
- Update AI-LOG.md, evidence and a clearly labelled draft self-assessment from observed facts. Commit/push the task branch and open its review PR when included in the user's assigned work.

## Ask first

- Change another member's files, dependencies, CI gates, branch rules or repo visibility unless the current task already authorizes it.
- Call a real model, spend money, create/rotate credentials or change provider budgets. Agree on provider/model, hard account cap and per-lab cap first.
- Publish real marks, reopen grades, deploy, delete real data, send student data/code externally or contact other people.
- Rewrite published history, force-push, merge, create/move the final submission tag or submit to Classroom unless specifically authorized. The team plan assigns the final tag to Tú.

## Never

- Put real credentials in Git, AI prompts, logs, screenshots or ZIPs. Ignore rules do not authorize exposing credentials to an assistant.
- Pass secrets into untrusted C++ execution. The future sandbox must have no network, run non-root, expose no host mounts/Docker socket, and limit CPU/wall time, memory, processes and output.
- Call real models in unit/contract tests; weaken assertions, eval data/labels/thresholds to conceal defects; swallow check failures; merge deliberately broken evidence code.
- Bypass main's required checks or fabricate evidence, approvals or a configured spending cap.

## Environment and credential handling

[.env.example](../.env.example) lists `PORT` and `CHROME_PATH` for the demo/browser configuration, plus `GEMINI_API_KEY` and `GEMINI_MODEL` for the explicitly manual [setup check](../scripts/model-smoke.js). The demo and CI never load or use the model credential. Leave optional demo variables unset for defaults; loading the example's blank `PORT` would request port 0, not 3007.

The `tok-*` strings in `src/db.js` are public demo identities seeded in memory at startup, not provider keys. They are unsuitable for deployed authentication; never replace them with real credentials in source.

Scan the current tree and all fetched refs before handover; repeat after teammates' branches merge and before packaging. If a real credential appears, stop using it, report its location without its value, obtain authority to revoke/rotate, and record the incident. Deleting the current file does not remove a secret from history; do not rewrite shared history without approval.

Google Gemini `gemini-3.8-flash` is provisioned on the separate LeeTKOB PA2 **Free tier** project with **no billing account linked**, an effective paid spending limit of **USD 0**. The key inherits project billing status, is stored only in ignored `.env`, and must never be packaged or copied into prompts/logs/screenshots. This is not a paid-tier numeric cap or a budget alert. Never enable billing or paid fallback without authorization. See [model/budget evidence](model-budget.md); only the manual synthetic setup check may contact the provider, never unit/contract/CI tests. Student code must not be sent until the team has approved the free-tier data handling policy.
