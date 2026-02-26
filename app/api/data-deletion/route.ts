export const runtime = "nodejs";

import { supabaseAdmin, assertSupabaseEnv } from "../../../src/lib/rag/supabaseAdmin";

export async function POST(request: Request) {
  try {
    assertSupabaseEnv();
    
    const body = await request.json().catch(() => ({}));
    const email = body?.email ? String(body.email).trim().toLowerCase() : null;
    
    if (!email || !email.includes('@')) {
      return Response.json(
        { ok: false, error: "valid_email_required" },
        { status: 400 }
      );
    }
    
    console.log(`[data-deletion] Request received for: ${email.charAt(0)}***@${email.split('@')[1]}`);
    
    const { error } = await supabaseAdmin
      .from("admin_audit_logs")
      .insert({
        action: "DATA_DELETION_REQUEST",
        details: { email_hash: email },
        performed_by: "system",
      });
    
    if (error) {
      console.error("[data-deletion] audit log failed:", error);
    }
    
    return Response.json({
      ok: true,
      message: "Your data deletion request has been received. We will process it within 30 days and send a confirmation to your email.",
    });
  } catch (error: any) {
    console.error("[data-deletion] error:", error);
    return Response.json(
      { ok: false, error: "request_failed" },
      { status: 500 }
    );
  }
}
