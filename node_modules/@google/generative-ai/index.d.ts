export interface GeminiOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export function generateGeminiResponse(
  apiKey: string,
  model: string,
  prompt: string,
  options?: GeminiOptions
): Promise<Response>;
