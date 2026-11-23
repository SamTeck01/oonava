import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";

// Claude is Oonava's main AI. Haiku handles high-volume work (lead scoring, cold emails, replies);
// Sonnet handles proposals and web research for buying signals. Groq and Gemini remain as backups.
export const claudeEnabled = () => Boolean(env.anthropicKey);
export const FAST_MODEL = () => env.anthropicFastModel;
export const SMART_MODEL = () => env.anthropicSmartModel;

let _client: Anthropic | null = null;
export const claude = () => (_client ??= new Anthropic({ apiKey: env.anthropicKey, maxRetries: 2 }));

type GeminiSchema = { type: string; properties?: Record<string, GeminiSchema>; items?: GeminiSchema; enum?: string[]; required?: string[] };

// Our prompts describe schemas Gemini-style (type: "OBJECT"); Claude's structured outputs take JSON Schema.
export function toJsonSchema(s: GeminiSchema): Record<string, unknown> {
  const type = s.type.toLowerCase();
  if (type === "object") {
    const props = Object.fromEntries(Object.entries(s.properties ?? {}).map(([k, v]) => [k, toJsonSchema(v)]));
    return { type: "object", properties: props, required: Object.keys(props), additionalProperties: false };
  }
  if (type === "array") return { type: "array", items: toJsonSchema(s.items ?? { type: "STRING" }) };
  return s.enum ? { type, enum: s.enum } : { type };
}

// Structured JSON from Claude. Throws on failure or refusal so callers can fall back.
export async function claudeJson(system: string, prompt: string, schema: object, opts: { smart?: boolean; timeoutMs?: number } = {}): Promise<string> {
  const model = opts.smart ? SMART_MODEL() : FAST_MODEL();
  const response = await claude().messages.create(
    {
      model,
      max_tokens: opts.smart ? 16000 : 4000,
      system,
      messages: [{ role: "user", content: prompt }],
      output_config: { effort: opts.smart ? "medium" : "low", format: { type: "json_schema", schema: toJsonSchema(schema as GeminiSchema) } },
    },
    { timeout: opts.timeoutMs ?? 60_000 },
  );
  if (response.stop_reason === "refusal") throw new Error(`Claude declined (${response.stop_details?.category ?? "unknown"})`);
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Claude returned no text");
  return text.text;
}

// Read a PDF (e.g. a lead list) and return the model's text answer.
export async function claudeDocument(base64: string, instruction: string): Promise<string> {
  const response = await claude().messages.create(
    {
      model: SMART_MODEL(),
      max_tokens: 16000,
      messages: [{ role: "user", content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
        { type: "text", text: instruction },
      ] }],
      output_config: { effort: "low" },
    },
    { timeout: 120_000 },
  );
  if (response.stop_reason === "refusal") throw new Error("Claude declined");
  return response.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
}

// Web research with Claude's built-in web search. Continues paused turns; returns the final text.
export async function claudeResearch(system: string, prompt: string, maxSearches = 12): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 5; turn++) {
    const response = await claude().messages.create(
      {
        model: SMART_MODEL(),
        max_tokens: 16000,
        system,
        messages,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: maxSearches, user_location: { type: "approximate", country: "GB" } }],
        output_config: { effort: "medium" },
      },
      { timeout: 240_000 },
    );
    if (response.stop_reason === "refusal") throw new Error("Claude declined the research request");
    if (response.stop_reason === "pause_turn") { messages.push({ role: "assistant", content: response.content }); continue; }
    return response.content.map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();
  }
  throw new Error("Research did not finish");
}
