/**
 * HEALO: Step2 intake 저장 API (서버 전용)
 * inquiries.intake에 Step2 데이터 저장 (PII 없음)
 * public_token 검증 후 overwrite (MVP)
 */

import { supabaseAdmin } from "../../../../src/lib/rag/supabaseAdmin";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // ✅ Security: 암호화 키 검증 (fail-fast)
  try {
    assertEncryptionKey();
  } catch (error: any) {
    console.error("[api/inquiries/intake] encryption key validation failed:", error);
    return Response.json(
      { ok: false, error: "encryption_key_missing", detail: error?.message },
      { status: 500 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const inquiryId = body?.inquiryId != null
      ? (typeof body.inquiryId === "number" ? body.inquiryId : Number(body.inquiryId))
      : null;
    const publicToken = body?.publicToken ? String(body.publicToken) : null;
    const intakePatch = body?.intakePatch;

    if (inquiryId == null || isNaN(inquiryId)) {
      return Response.json(
        { ok: false, error: "inquiry_id_required" },
        { status: 400 }
      );
    }

    if (!publicToken) {
      return Response.json(
        { ok: false, error: "public_token_required" },
        { status: 400 }
      );
    }

    if (!intakePatch || typeof intakePatch !== "object" || Array.isArray(intakePatch)) {
      return Response.json(
        { ok: false, error: "intake_patch_must_be_object" },
        { status: 400 }
      );
    }

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("inquiries")
      .select("id, public_token, intake, attachments")
      .eq("id", inquiryId)
      .maybeSingle();

    if (fetchErr) {
      console.error("[api/inquiries/intake] fetch error:", fetchErr);
      return Response.json(
        { ok: false, error: "inquiry_fetch_failed" },
        { status: 500 }
      );
    }

    if (!row) {
      return Response.json(
        { ok: false, error: "inquiry_not_found" },
        { status: 404 }
      );
    }

    const stored = row.public_token;
    if (stored == null || String(stored) !== String(publicToken)) {
      console.error("[api/inquiries/intake] public_token mismatch");
      return Response.json(
        { ok: false, error: "invalid_public_token" },
        { status: 403 }
      );
    }

    const patch = { ...intakePatch } as Record<string, unknown>;
    const extra = Array.isArray(patch.attachments_extra) ? (patch.attachments_extra as { path: string; name?: string | null; type?: string | null }[]) : [];
    delete patch.attachments_extra;

    const existingIntake = (row.intake && typeof row.intake === "object" && !Array.isArray(row.intake))
      ? (row.intake as Record<string, unknown>)
      : {};
    const mergedIntake = { ...existingIntake, ...patch };

    const existingAttachments = Array.isArray(row.attachments) ? row.attachments : [];
    const mergedAttachments = [...existingAttachments, ...extra];

    const updatePayload: Record<string, unknown> = { intake: mergedIntake };
    if (extra.length) updatePayload.attachments = mergedAttachments;

    const { error: updateErr } = await supabaseAdmin
      .from("inquiries")
      .update(updatePayload)
      .eq("id", inquiryId);

    if (updateErr) {
      console.error("[api/inquiries/intake] update error:", updateErr);
      return Response.json(
        { ok: false, error: "intake_update_failed" },
        { status: 500 }
      );
    }

    console.log("[api/inquiries/intake] success:", { inquiryId });
    return Response.json({ ok: true });
  } catch (error: any) {
    console.error("[api/inquiries/intake] error:", error);
    return Response.json(
      { ok: false, error: error?.message || "intake_failed" },
      { status: 500 }
    );
  }
}
