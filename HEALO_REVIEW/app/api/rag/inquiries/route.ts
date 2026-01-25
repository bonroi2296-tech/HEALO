import { supabaseAdmin } from "../../../../src/lib/rag/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .select("id, email, treatment_type, message")
      .order("id", { ascending: false })
      .limit(50);

    if (error) throw error;
    return Response.json({ ok: true, rows: data || [] });
  } catch (error: any) {
    return Response.json(
      { ok: false, error: error?.message || "fetch_failed" },
      { status: 500 }
    );
  }
}
