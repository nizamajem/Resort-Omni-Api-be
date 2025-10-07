const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com';
const DEFAULT_TIMEOUT_MS = 20000;

function toAbortController(timeoutMs) {
  if (typeof AbortController !== 'function') {
    return { signal: undefined, cancel: () => {} };
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  if (typeof timeoutId.unref === 'function') {
    timeoutId.unref();
  }
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timeoutId),
  };
}

function getFetch(customFetch) {
  if (typeof customFetch === 'function') {
    return customFetch;
  }
  if (typeof fetch === 'function') {
    return fetch;
  }
  try {
    return require('node-fetch');
  } catch (error) {
    throw new Error('Global fetch not available and node-fetch is not installed.');
  }
}

/**
 * Minimal Gemini REST client used by the Resort backend.
 * Matches the legacy generateGeminiResponse helper expected by analytics.controller.
 */
async function generateGeminiResponse(apiKey, model, prompt, options = {}) {
  if (!apiKey) {
    throw new Error('Gemini API key is required.');
  }
  if (!model) {
    throw new Error('Gemini model is required.');
  }
  const { baseUrl = DEFAULT_BASE_URL, timeoutMs = DEFAULT_TIMEOUT_MS, fetch: customFetch } = options;
  const fetchImpl = getFetch(customFetch);
  const controller = toAbortController(timeoutMs);
  const url = new URL(`/v1beta/models/${encodeURIComponent(model)}:generateContent`, baseUrl);
  url.searchParams.set('key', apiKey);
  try {
    const response = await fetchImpl(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
      signal: controller.signal,
    });
    return response;
  } finally {
    controller.cancel();
  }
}

const api = { generateGeminiResponse };
api.default = api;

module.exports = api;
