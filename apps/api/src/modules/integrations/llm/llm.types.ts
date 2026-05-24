export type LlmProvider = 'groq' | 'anthropic';

export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmOptions {
  /** Use Claude (Premium) instead of Groq (free). Default: false */
  isPremium?: boolean;
  /** Override the default model for the chosen provider */
  model?: string;
  /** Maximum tokens in the response. Default: 2000 */
  maxTokens?: number;
  /** Sampling temperature 0–1. Default: 0.7 */
  temperature?: number;
  /** System prompt injected before the user message */
  systemPrompt?: string;
  /**
   * Conversation history (previous turns).
   * When provided, the prompt is treated as the latest user message
   * and caching is disabled (conversation mode).
   */
  history?: LlmMessage[];
  /** Force skip cache even for single-turn calls. Default: false */
  skipCache?: boolean;
}

export interface LlmResult {
  text: string;
  provider: LlmProvider;
  model: string;
  /** Approximate tokens consumed (prompt + completion) */
  totalTokens?: number;
  fromCache: boolean;
}

// ── Raw API shapes ─────────────────────────────────────────────────────────

/** Groq / OpenAI-compatible response */
export interface GroqChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}
