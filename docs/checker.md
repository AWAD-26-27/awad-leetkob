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
