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

The Gemini 3.8 dev-set run remains pending a successful synthetic request with provider metadata. [Worker and CLI commands](../../docs/checker.md#live-evaluation-and-budget)
