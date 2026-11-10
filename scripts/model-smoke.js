// Manual setup check only. Never run this in unit/contract tests or CI.
// Sends synthetic text, never student data. The project must remain free-tier.
const key = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;
if (!key || model !== 'gemini-3.8-flash') {
  throw new Error('Set GEMINI_API_KEY and GEMINI_MODEL=gemini-3.8-flash in ignored .env');
}

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Reply with exactly OK. No other text.' }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 256 },
    }),
    signal: globalThis.AbortSignal.timeout(30000),
  },
);
// Never print request headers, a provider error body or the credential.
if (!response.ok) throw new Error(`Gemini setup check failed: HTTP ${response.status}`);
const body = await response.json();
const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
if (text?.trim() !== 'OK') throw new Error('Gemini did not return the expected synthetic reply');
console.log(
  JSON.stringify({ model, status: response.status, reply: 'OK', usage: body.usageMetadata }),
);
