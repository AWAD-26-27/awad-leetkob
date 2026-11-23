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

The proposed model is `gemini-3.8-flash` on the previously provisioned free-tier project. Live inference and the approved dataset/model combination are pending. The worker integration is verified against the shared fixture. Deployment configuration and real prediction, report and call log artifacts depend on a successful authorized run.

Once usage is approved, set `GEMINI_API_KEY` and the approved `GEMINI_MODEL` in an ignored `.env`. Start with the public dev set and use an explicit positive request cap per problem. For example, `MAX_MODEL_CALLS_PER_LAB=16` accommodates the largest dev problem's 8 solutions × 2 semantic constraints. Omit `MODEL_OFF` for that run.

```sh
mkdir -p /tmp/leetkob-live
MAX_MODEL_CALLS_PER_LAB=16 CHECKER_CAPTURE_PROMPT=1 CHECKER_CALL_LOG=/tmp/leetkob-live/dev.calls.jsonl \
  node --env-file=.env src/checker/cli.js eval/dev /tmp/leetkob-live/dev.predictions.jsonl
node eval/dev/eval.mjs --data eval/dev --predictions /tmp/leetkob-live/dev.predictions.jsonl \
  --json /tmp/leetkob-live/dev.eval.json
```

For an 80-submission `sort-merge` lab, 80 Accepted submissions × 1 semantic constraint × 1 attempt yields at most **80 calls**. A lab with two semantic constraints needs up to 160. At free-tier rates and within quota, 80 × USD 0 per call = **USD 0 projected provider cost**. Use observed token totals and the selected model's input/output rates for any paid estimate. Throughput, actual tokens and actual per-lab cost await live measurement. [Free-tier setup](model-budget.md)
