# Gemini 3.8 provider checks

24 November 2026. The checks used the existing dedicated free-tier project and synthetic inputs. Request IDs and token counts were absent from the failed generation responses. The checker left those fields `null` in the error log.

| Check | Observed result |
| --- | --- |
| Model lookup, `GET /v1beta/models/gemini-3.8-flash` | HTTP 200. The model lists `generateContent`. |
| Plain generation, synthetic `OK` smoke test | HTTP 503 `UNAVAILABLE`. |
| Checker JSON request, one synthetic semantic constraint | HTTP 503 `UNAVAILABLE`. Checker returned `unsure`, `guardrail_fallback`, with `status: error`, 5,277 ms, and `costUsd: 0` under the configured free tier. |
| Synthetic generation with `thinkingLevel: MINIMAL` | HTTP 400 `INVALID_ARGUMENT`. |
| Synthetic generation with `thinkingLevel: LOW` and with provider defaults | Both returned HTTP 503 `UNAVAILABLE`. The response indicated high demand. |
| Synthetic generation via stable `v1` and via `v1beta` streaming | Both returned HTTP 503. The `v1` response indicated high demand. |

## Fresh project and model selection

Created LeeTKOB PA3 Gemini in Cloud Console. Google automatically linked the new project to the signed-in account's billing account. We disabled that link before key creation or inference, then confirmed the project billing page showed no linked account. We enabled the Gemini API, created a dedicated service account and bound a Gemini-restricted key to it. The key is stored in a private local environment file.

| Requested model | Existing free-tier project | New unbilled project |
| --- | --- | --- |
| `gemini-3.8-flash` | HTTP 503 | HTTP 503 |
| `gemini-3.7-flash` | HTTP 503 | HTTP 503 |
| `gemini-3.6-flash` | Timed out at 20 s | Initially timed out. A direct retry returned HTTP 200 and a valid verdict with request ID `h4kFa9WIEcr31e8PvOzW8AY` in 9,425 ms. |
| `gemini-3.5-flash` | Timed out at 20 s | HTTP 200. Provider reported `gemini-3.6-flash` as the serving model. |
| `gemini-3.5-flash-lite` | HTTP 200 with a valid verdict and provider ID | First ten dev-set attempts returned three HTTP 200s, five HTTP 503s and two timeouts. |

Gemini 3.6 answered five of its first ten dev-set requests and hit the 20-second timeout on the other five. Gemini 3.5 Flash reported 3.6 as its serving model. The [worker settings and public evaluation command](../../docs/checker.md#live-evaluation-and-budget) use Gemini 3.5 Flash-Lite on the original unbilled project.
