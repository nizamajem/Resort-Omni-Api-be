export interface GeminiOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export interface GeminiModule {
  generateGeminiResponse(
    apiKey: string,
    model: string,
    prompt: string,
    options?: GeminiOptions
  ): Promise<Response>;
}

export const generateGeminiResponse: GeminiModule['generateGeminiResponse'];

declare const _default: GeminiModule;
export default _default;
