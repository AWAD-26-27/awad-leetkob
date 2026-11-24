# PA3 checker

The worker imports `evaluateSubmission` from `src/checker/index.js` and passes the original C++ source with lab constraint codes (`C1`, `C2`, etc.). Call the checker for Accepted submissions. Map each returned code to `constraints.id` when writing verdicts and call logs.

```js
import { evaluateSubmission } from './src/checker/index.js';

const { verdicts, callLogs } = await evaluateSubmission({
  statement,
  constraints: [{ id: 'C1', text: 'Do not call `std::min`.' }],
  code,
  options: { modelOff: true },
});
```

Use the [shared worker fixture](../test/fixtures/pa3-checker-handoff.json) as a contract test. With `MODEL_OFF=1`, C1 is `violation` on line 2, C2 is `unsure`, and `callLogs` is empty. The checker also accepts `options.modelOff: true` for fixtures that run in process.

For model-backed worker runs, pass `reserveModelCall({ constraintId })` backed by the lab quota and the current job claim. The checker invokes it only for a semantic constraint before a request. Returning `false` or throwing gives `guardrail_fallback` with no call log. `timeoutMs` defaults to 20,000. An injected `modelClient` can provide `model` and `generate({ prompt, signal })`, returning `{ output, providerRequestId, model, promptTokens, completionTokens, costUsd }`. `output` is raw JSON text with `verdict` and `evidence`. Provider metadata fields may be omitted.

The checker parses C++ with Tree-sitter WASM and derives the ban list from the backticked names in `Do not use` and `Do not call` constraints. Rules cover qualified calls and types, common `using` imports and namespace aliases, loop statements, and names inside invoked macros. The analysis uses syntax and local declarations. General C++ overload resolution, indirect calls, and full preprocessing are outside its scope.

For semantic constraints, the model sees one constraint, the statement and numbered C++ lines. Source comments, string contents, student-ID-sized numbers, and locally declared identifiers are redacted or pseudonymized. The checker matches the model's quoted evidence against the numbered sanitized line and emits the corresponding verbatim original line. The default log stores operational metadata with `prompt: null`. Enable prompt capture only for authorized public or synthetic data.

## CLI and Docker

Run from the repo root with Node 22. The lecturer's [dev set and scorer](https://github.com/fithcmus/awad-leetkob-eval/tree/552c811db2d35a23d641bc4fdffc1ac120be1a28) are pinned byte-for-byte under `eval/dev/`. The five authored C++ solutions and their tags and labels are under `eval/custom/`. Each solution passed all three custom judge tests under `g++ -std=c++17 -O2`.

```sh
npm ci
mkdir -p /tmp/leetkob-eval
MODEL_OFF=1 node src/checker/cli.js eval/dev /tmp/leetkob-eval/dev.jsonl
node eval/dev/eval.mjs --data eval/dev --predictions /tmp/leetkob-eval/dev.jsonl --json /tmp/leetkob-eval/dev.json

docker build -f checker.Dockerfile -t leetkob-checker:pa3 .
docker run --rm --network none -e MODEL_OFF=1 \
  -e CHECKER_CALL_LOG=/out/dev.calls.jsonl \
  --user "$(id -u):$(id -g)" \
  --mount "type=bind,source=$PWD/eval/dev,target=/dataset,readonly" \
  --mount "type=bind,source=/tmp/leetkob-eval,target=/out" \
  leetkob-checker:pa3 /dataset /out/dev.jsonl
```

Use `eval/custom` as the input to the same CLI and scorer for the separate custom set. The CLI writes one JSONL row per solution and constraint in dataset order. `CHECKER_CALL_LOG` optionally writes one log row per model request, with the solution ID. `CHECKER_CAPTURE_PROMPT=1` includes the sanitized prompt in that file.

The network-disabled Docker run produced [dev predictions](../evidence/pa3-checker/dev-offline.predictions.jsonl), [dev report](../evidence/pa3-checker/dev-offline.eval.json), and an [empty dev call log](../evidence/pa3-checker/dev-offline.calls.jsonl). The [custom predictions](../evidence/pa3-checker/custom-offline.predictions.jsonl), [custom report](../evidence/pa3-checker/custom-offline.eval.json), and [empty custom call log](../evidence/pa3-checker/custom-offline.calls.jsonl) came from the same image and settings.

| Offline dataset | Predictions | Ban-list pairs correct | Wrongful deductions | Semantic unsure | Scorer exit |
| --- | ---: | ---: | ---: | ---: | ---: |
| Lecturer dev | 102/102 | 55/55 | 0 | 47 | 1 |
| Custom | 10/10 | 5/5 | 0 | 5 | 1 |

The scorer includes semantic constraints in its recall and unsure thresholds. Offline recall was 15/37 on the dev set and 2/3 on the custom set. Every caught violation cited a labelled line with the original text.

## Live evaluation and budget

PA3 uses Google Gemini `gemini-3.8-flash`. The team's model budget is **USD 0** on the dedicated free-tier project. The project was verified with no Cloud Billing account linked, so provider quotas bound usage and there is no paid overage path. Google lists text input and output, including thinking tokens, as free within quota. Provider quotas are shared across labs and can stop requests before the application cap. [Project evidence](model-budget.md) · [Pricing](https://aistudio.google.com/docs/pricing#gemini-3.8-flash) · [Rate limits](https://aistudio.google.com/docs/rate-limits)

For the `sort-merge` demo lab, 80 Accepted submissions × 1 semantic constraint × 1 attempt per constraint = **80 requests**. At free-tier rates, 80 requests × USD 0 = **USD 0 projected provider cost** within quota. The worker transactionally reserves from a cumulative **80-request cap per lab** before each request. Failed or interrupted attempts consume reservations, and two semantic constraints per submission can exhaust the cap after 40 Accepted submissions. Once the cap is reached, the semantic verdict becomes `unsure` before any provider request.

Set these in the worker's private environment. Keep `MODEL_OFF=1` until a smoke request succeeds, then unset it in the worker service and restart. Use `sort-merge/s01.cpp` with `sort-merge/C2` as the compliant semantic smoke case. Check that the job is `done`, the submission is `judged`, and the TA queue has the C1 hard-rule verdict and C2 model verdict. The C2 call log in SQLite should have a provider request ID, model, token counts, latency and `cost_usd = 0`. Supply the API key privately to the worker process.

| Variable | Worker value |
| --- | --- |
| `GEMINI_MODEL` | `gemini-3.8-flash` |
| `GEMINI_BILLING_TIER` | `free` for the verified free-tier project |
| `MAX_MODEL_CALLS_PER_LAB` | `80` |
| `GEMINI_API_KEY` | Dedicated project key in the private worker environment |

`GEMINI_BILLING_TIER=free` records `costUsd: 0` for each attempt. The number comes from the free-tier rates. The flag declares the project's billing tier for the log. The provider's billing settings control paid usage. Leave the flag unset when the tier is unknown and the checker records `costUsd: null`. Provider-supplied request IDs and token counts are recorded when present. Deployment logs retain metadata, and the public dev-set CLI can also record sanitized prompts for the rubric.

On 24 November 2026 the model lookup returned HTTP 200, and generation with both default and low thinking returned HTTP 503 `UNAVAILABLE` due to high demand. Google supplied no generation request ID or tokens for those failures. The Gemini 3.8 live predictions, eval report and call log are pending. [Provider checks](../evidence/pa3-checker/gemini-3.8-probes.md)

When Gemini 3.8 inference is available, put `GEMINI_API_KEY` in an ignored `.env`. The following authorized public dev-set command reserves up to 16 calls per problem, which covers 47 semantic pairs across the six problems. Unset `MODEL_OFF` in the shell and in `.env` for that run. The three files in `evidence/pa3-checker/live/` are the proof to commit after verifying the run and scanning its log.

```sh
mkdir -p evidence/pa3-checker/live
GEMINI_MODEL=gemini-3.8-flash GEMINI_BILLING_TIER=free MAX_MODEL_CALLS_PER_LAB=16 \
  CHECKER_CAPTURE_PROMPT=1 CHECKER_CALL_LOG=evidence/pa3-checker/live/calls.jsonl \
  node --env-file=.env src/checker/cli.js eval/dev evidence/pa3-checker/live/predictions.jsonl
node eval/dev/eval.mjs --data eval/dev --predictions evidence/pa3-checker/live/predictions.jsonl \
  --json evidence/pa3-checker/live/eval.json
```
