/**
 * HEALO: Inquiry Funnel 이벤트 수집 API (서버 전용)
 * step1_viewed, step1_submitted, step2_viewed, step2_submitted
 * 
 * ✅ P0 수정: 런타임 명시 (Node.js)
 * 
 * 이유:
 * - DB 관리자 접근 (SERVICE_ROLE_KEY 사용)
 * - Edge 런타임에서 발생할 수 있는 예측 불가 오류 방지
 */
export const runtime = "nodejs";

import { z } from "zod";
import { supabaseAdmin, assertSupabaseEnv } from "../../../../src/lib/rag/supabaseAdmin";
import { NextRequest } from "next/server";

const ALLOWED_EVENT_TYPES = [
  "step1_viewed",
  "step1_submitted",
  "step2_viewed",
  "step2_submitted",
] as const;

type EventType = (typeof ALLOWED_EVENT_TYPES)[number];

const REQUIRES_INQUIRY_ID: EventType[] = ["step1_submitted", "step2_viewed", "step2_submitted"];

const eventSchema = z.object({
  eventType: z.enum(["step1_viewed", "step1_submitted", "step2_viewed", "step2_submitted"]),
  inquiryId: z.number().optional().nullable(),
  meta: z.record(z.unknown()).optional().default({}),
});

export async function POST(request: NextRequest) {
  try {
    assertSupabaseEnv();
    const body = await request.json().catch(() => ({}));

    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      if (firstIssue?.path?.[0] === "eventType") {
        return Response.json(
          { ok: false, error: "invalid_event_type", allowed: ALLOWED_EVENT_TYPES },
          { status: 400 }
        );
      }
      return Response.json(
        { ok: false, error: "invalid_event_type", allowed: ALLOWED_EVENT_TYPES },
        { status: 400 }
      );
    }

    const { eventType, inquiryId, meta } = parsed.data;

    if (REQUIRES_INQUIRY_ID.includes(eventType as EventType)) {
      if (inquiryId == null || isNaN(inquiryId)) {
        return Response.json(
          { ok: false, error: "inquiry_id_required" },
          { status: 400 }
        );
      }
    }

    const { error: insertError } = await supabaseAdmin
      .from("inquiry_events")
      .insert({
        inquiry_id: inquiryId || null,
        event_type: eventType,
        meta,
      });

    if (insertError) {
      console.error("[api/inquiries/event] insert error:", insertError);
      return Response.json(
        { ok: false, error: "event_insert_failed" },
        { status: 500 }
      );
    }

    console.log("[api/inquiries/event] success:", { eventType, inquiryId });
    return Response.json({ ok: true });
  } catch (error: any) {
    console.error("[api/inquiries/event] error:", error);
    return Response.json(
      { ok: false, error: error?.message || "event_failed" },
      { status: 500 }
    );
  }
}
