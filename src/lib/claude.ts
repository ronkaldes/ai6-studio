import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Core runner ───────────────────────────────────────────────

interface RunSkillParams {
  systemPrompt: string;
  userMessage: string;
  enableWebSearch?: boolean;
  maxTokens?: number;
}

export async function runSkill(params: RunSkillParams): Promise<string> {
  const tools: Anthropic.Tool[] = params.enableWebSearch
    ? [{ type: 'web_search_20250305', name: 'web_search' } as any]
    : [];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: params.maxTokens ?? 4096,
    system: params.systemPrompt,
    ...(tools.length > 0 && { tools }),
    messages: [{ role: 'user', content: params.userMessage }],
  });

  // Extract text blocks — skip tool_use and tool_result blocks
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return text;
}

// ── JSON parser — strips markdown fences if present ──────────

export function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

// ── Agent runner — runs a single agent and parses output ─────

export async function runAgent<T>(
  systemPrompt: string,
  ideaDescription: string,
): Promise<T> {
  const raw = await runSkill({
    systemPrompt,
    userMessage: `Idea to evaluate:\n\n${ideaDescription}\n\nRespond with JSON only.`,
    maxTokens: 1024,
  });
  return parseJSON<T>(raw);
}

// ── Streaming variant for long-form generation ───────────────

export async function streamSkill(params: RunSkillParams): Promise<ReadableStream> {
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: params.maxTokens ?? 4096,
    system: params.systemPrompt,
    messages: [{ role: 'user', content: params.userMessage }],
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });
}
