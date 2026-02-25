/**
 * HOSPITAL_OFFER_IMPORT_V1: 수집 텍스트에서 대표 시술 3개 LLM 추출
 * - 출처 없는 값 null. 효과/확정가/verified 금지.
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { OfferItem, TreatmentOffer, OfferEvidence } from "./types";

const LLM_PROVIDER = (process.env.LLM_PROVIDER || "google").toLowerCase();

function getModel() {
  if (LLM_PROVIDER === "google" && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-2.0-flash") as any;
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini") as any;
  }
  return null;
}

const SYSTEM_PROMPT = `You extract "representative treatments/programs" (up to 3) from hospital website text for HEALO.

Rules (strict):
- Only include fields where you find explicit evidence in the text. Leave any field without evidence as null or [].
- Do NOT invent prices, recovery time, or effects. No "verified" wording. Use captured_at/source_url only.
- Do NOT make medical claims (e.g. "treats X", "guaranteed results"). If the hospital states something, summarize as "병원은 ...라고 설명합니다" only.
- Price: if only a range or "from X" appears, use that; if unclear, leave null. Do not fix or confirm prices.
- Output ONLY valid JSON, no markdown fences.

Output schema (exactly):
{
  "offers": [
    {
      "treatment": {
        "name": "required",
        "slug": null or "url-safe-slug",
        "description": null or string,
        "full_description": null or string,
        "duration": null or number (minutes),
        "anesthesia_type": null or string,
        "recovery_time_min": null or number,
        "recovery_time_max": null or number,
        "side_effects": [],
        "precautions": [],
        "price_min": null or number,
        "price_max": null or number,
        "currency": null or "KRW" etc,
        "price_includes": [],
        "tags": [],
        "images": []
      },
      "evidence": {
        "name": { "source_url": "page url", "snippet_or_ocr_text": "exact quote" },
        ... one entry per field that has evidence (at least "name")
      },
      "confidence": 0.0 to 1.0
    }
  ]
}
Max 3 items in offers. If nothing relevant, return { "offers": [] }.`;

function tryParseOffers(raw: string): OfferItem[] {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed?.offers) ? parsed.offers : [];
    const result: OfferItem[] = [];
    for (const o of arr.slice(0, 3)) {
      if (!o?.treatment?.name) continue;
      const treatment: TreatmentOffer = {
        name: String(o.treatment.name),
        slug: o.treatment.slug ?? null,
        description: o.treatment.description ?? null,
        full_description: o.treatment.full_description ?? null,
        duration: o.treatment.duration ?? null,
        anesthesia_type: o.treatment.anesthesia_type ?? null,
        recovery_time_min: o.treatment.recovery_time_min ?? null,
        recovery_time_max: o.treatment.recovery_time_max ?? null,
        side_effects: Array.isArray(o.treatment.side_effects) ? o.treatment.side_effects : [],
        precautions: Array.isArray(o.treatment.precautions) ? o.treatment.precautions : [],
        price_min: o.treatment.price_min ?? null,
        price_max: o.treatment.price_max ?? null,
        currency: o.treatment.currency ?? null,
        price_includes: Array.isArray(o.treatment.price_includes) ? o.treatment.price_includes : [],
        tags: Array.isArray(o.treatment.tags) ? o.treatment.tags : [],
        images: Array.isArray(o.treatment.images) ? o.treatment.images : [],
      };
      const evidence: OfferEvidence = typeof o.evidence === "object" && o.evidence !== null ? o.evidence : {};
      const confidence = typeof o.confidence === "number" ? Math.max(0, Math.min(1, o.confidence)) : 0.5;
      result.push({ treatment, evidence, confidence });
    }
    return result;
  } catch {
    return [];
  }
}

export function isExtractOffersAvailable(): boolean {
  return getModel() !== null;
}

export async function extractOffersFromText(
  combinedText: string,
  sourceUrls: string[]
): Promise<OfferItem[]> {
  const model = getModel();
  if (!model) return [];

  if (!combinedText || combinedText.length < 50) return [];

  const sourceList = sourceUrls.length ? sourceUrls.join(", ") : "unknown";
  const prompt = `Source URLs: ${sourceList}\n\nExtract up to 3 representative treatments/programs from the following text. Only include fields with evidence.\n\nText:\n${combinedText.slice(0, 120000)}`;

  try {
    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.2,
      maxTokens: 4096,
    });
    return tryParseOffers(text);
  } catch (e) {
    console.error("[extractOffersLLM]", e);
    return [];
  }
}
