import Anthropic from "@anthropic-ai/sdk";
import type { ModelId } from "@usemoos/types";

const anthropic = new Anthropic({
  apiKey: process.env.LITELLM_API_KEY ?? process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.LITELLM_URL,
});

export interface LLMStreamChunk {
  type: "text" | "done";
  text?: string;
}

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Stream a response from Claude. Yields text deltas until done.
 * Model is swappable per call — workspace preferred_model flows in here.
 */
export async function* streamCompletion(
  model: ModelId,
  messages: LLMMessage[],
  systemPrompt: string,
  maxTokens = 2048,
): AsyncGenerator<LLMStreamChunk> {
  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield { type: "text", text: event.delta.text };
    }
  }

  yield { type: "done" };
}

/**
 * Non-streaming completion — used for lightweight tasks like query
 * decomposition and intent extraction.
 */
export async function complete(
  model: ModelId,
  prompt: string,
  systemPrompt = "",
  maxTokens = 512,
): Promise<string> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}
