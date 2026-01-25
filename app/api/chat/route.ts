import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { supabaseAdmin } from "../../../src/lib/rag/supabaseAdmin";
import {
  createEmptyIntake,
  computeMissingFields,
  computeExtractionConfidence,
  type Intake,
  type IntakeMeta,
} from "../../../src/lib/intakeSchema";
import {
  bodyPartFromText,
  contraindicationsAndFlagsFromMessage,
  extractTimelineFromQuery,
  extractBudgetFromQuery,
  extractDurationFromQuery,
  extractSeverityFromQuery,
} from "../../../src/lib/intakeExtract";
import { encryptText, assertEncryptionKey } from "../../../src/lib/security/encryption";

type ChatMessage = { role: string; content: string };

const isProd = process.env.NODE_ENV === "production";
const LLM_PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();

const jsonError = (
  status: number,
  code: string,
  detail?: string,
  meta?: Record<string, any>
) => {
  return Response.json(
    {
      ok: false,
      error: code,
      ...(isProd ? {} : { detail, meta }),
    },
    { status }
  );
};

const getModel = () => {
  if (LLM_PROVIDER === "google") {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("[api/chat] GOOGLE_GENERATIVE_AI_API_KEY is missing");
      return { error: jsonError(500, "google_key_missing", "GOOGLE_GENERATIVE_AI_API_KEY is missing") };
    }
    return { model: google("gemini-2.0-flash") as any };
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("[api/chat] OPENAI_API_KEY is missing");
    return { error: jsonError(500, "openai_key_missing", "OPENAI_API_KEY is missing") };
  }
  return { model: openai("gpt-4o-mini") as any };
};

const getModelName = () =>
  LLM_PROVIDER === "google" ? "gemini-2.0-flash" : "gpt-4o-mini";

const classifyOpenAiError = (error: any) => {
  const message = String(error?.message || "");
  const lower = message.toLowerCase();

  if (lower.includes("insufficient_quota") || lower.includes("quota")) {
    return { status: 402, code: "openai_quota_exceeded", message };
  }
  if (lower.includes("invalid_api_key") || lower.includes("api key")) {
    return { status: 401, code: "openai_invalid_key", message };
  }
  if (
    lower.includes("model") &&
    (lower.includes("not found") || lower.includes("does not exist") || lower.includes("access"))
  ) {
    return { status: 403, code: "openai_model_access", message };
  }
  if (lower.includes("rate limit")) {
    return { status: 429, code: "openai_rate_limited", message };
  }
  return { status: 502, code: "openai_error", message };
};

const classifyGoogleError = (error: any) => {
  const message = String(error?.message || "");
  const lower = message.toLowerCase();

  if (lower.includes("api key")) {
    return { status: 401, code: "google_invalid_key", message };
  }
  if (lower.includes("quota") || lower.includes("insufficient")) {
    return { status: 402, code: "google_quota_exceeded", message };
  }
  if (lower.includes("permission") || lower.includes("access")) {
    return { status: 403, code: "google_access_denied", message };
  }
  if (lower.includes("rate limit")) {
    return { status: 429, code: "google_rate_limited", message };
  }
  return { status: 502, code: "google_error", message };
};

const buildContext = (chunks: Array<any>) => {
  if (!Array.isArray(chunks) || chunks.length === 0) return "";
  const lines = chunks.map((c) => {
    const title = c?.rag_documents?.title ? ` | ${c.rag_documents.title}` : "";
    const source = c?.rag_documents?.source_type
      ? `[${c.rag_documents.source_type}${title}]`
      : "[source]";
    return `${source} ${String(c.content || "").trim()}`;
  });
  return lines.join("\n\n");
};

const getLastUserMessage = (messages: ChatMessage[] = []) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return messages[i];
  }
  return null;
};

function buildIntakeFromQuery(query: string): Intake {
  const { intake } = createEmptyIntake("ai_agent");
  try {
    const q = String(query || "").trim();
    intake.chief_complaint = q ? q.slice(0, 300) : null;
    intake.goal = null;
    intake.body_part = bodyPartFromText(q) ?? null;
    intake.timeline = extractTimelineFromQuery(q) ?? null;
    intake.budget = extractBudgetFromQuery(q) ?? null;
    intake.duration = extractDurationFromQuery(q) ?? null;
    intake.severity = extractSeverityFromQuery(q) ?? null;
    const { contraindications, allergy, medications } = contraindicationsAndFlagsFromMessage(q);
    intake.contraindications = contraindications.length ? contraindications : null;
    intake.allergy_flag = allergy || null;
    intake.medications_flag = medications || null;
    intake.medical_history_flag = null;
    intake.previous_procedure_flag = null;
    intake.attachments_present = false;
  } catch {
    /* no-op */
  }
  return intake;
}

export async function POST(request: Request) {
  // ✅ Security: 암호화 키 검증 (fail-fast)
  try {
    assertEncryptionKey();
  } catch (error: any) {
    console.error("[api/chat] encryption key validation failed:", error);
    return jsonError(500, "encryption_key_missing", error?.message || "encryption_key_missing");
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch (error: any) {
    console.error("[api/chat] invalid json:", error);
    return jsonError(400, "invalid_json", error?.message || "invalid_json");
  }
  const messages: ChatMessage[] = Array.isArray(body?.messages)
    ? body.messages
    : [];
  const lang = body?.lang ? String(body.lang) : "en";
  const sessionId = body?.session_id ? String(body.session_id) : null;
  const page = body?.page ? String(body.page) : null;
  const utm = body?.utm && typeof body.utm === "object" ? body.utm : null;
  const lastUser = getLastUserMessage(messages);
  const query = String(lastUser?.content || "").trim();

  if (!query) {
    return jsonError(400, "user_message_required", "last user message is empty");
  }

  // Log normalized inquiry (best effort). constraints.intake + meta 동일 스키마 적재.
  void (async () => {
    try {
      let intake: Intake = buildIntakeFromQuery(query);
      const meta: IntakeMeta = {
        pipeline_version: "v1",
        source_type: "ai_agent",
        model: getModelName(),
        prompt_version: null,
      };
      const missing_fields = computeMissingFields(intake);
      const extraction_confidence = computeExtractionConfidence(intake, missing_fields);
      const constraints: Record<string, unknown> = {
        intake,
        meta,
      };
      if (sessionId != null) constraints.session_id = sessionId;
      if (page != null) constraints.page = page;
      if (utm != null) constraints.utm = utm;

      // ✅ Security: raw_message 암호화
      const rawMessageEnc = await encryptText(query);

      await supabaseAdmin.from("normalized_inquiries").insert({
        source_type: "ai_agent",
        language: lang,
        raw_message: rawMessageEnc, // 암호화된 값
        constraints,
        treatment_slug: null,
        objective: null,
        extraction_confidence,
        missing_fields: missing_fields.length ? missing_fields : null,
      });
    } catch (error) {
      console.error("[api/chat] normalized_inquiries insert failed:", error);
    }
  })();

  // RAG retrieval (top 6).
  let ragChunks: any[] = [];
  try {
    let q = supabaseAdmin
      .from("rag_chunks")
      .select(
        "id, document_id, chunk_index, content, rag_documents!inner(id, source_type, source_id, lang, title)"
      )
      .ilike("content", `%${query}%`)
      .limit(6);
    if (lang) q = q.eq("rag_documents.lang", lang);
    const { data, error } = await q;
    if (!error) ragChunks = data || [];
    if (error) console.error("[api/chat] rag query error:", error);
  } catch (error) {
    console.error("[api/chat] rag query failed:", error);
  }

  const context = buildContext(ragChunks);

  const systemPrompt = [
    "You are a medical concierge assistant for HEALO.",
    "Do not provide diagnosis, medical advice, or guarantees.",
    "Ask clarifying questions when constraints are missing.",
    "Primary objective: guide the user to submit an inquiry.",
    "If relevant, reference the provided context briefly.",
    "",
    context ? "Context:\n" + context : "",
  ]
    .filter(Boolean)
    .join("\n");

  const modelResult = getModel();
  if (modelResult.error) return modelResult.error;

  try {
    const result = await streamText({
      model: modelResult.model,
      system: systemPrompt,
      messages: messages as any,
      onError: ({ error }) => {
        console.error("[api/chat] stream error:", error);
      },
    });
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[api/chat] LLM error:", error);
    const classified =
      LLM_PROVIDER === "google"
        ? classifyGoogleError(error)
        : classifyOpenAiError(error);
    return jsonError(classified.status, classified.code, classified.message);
  }
}
