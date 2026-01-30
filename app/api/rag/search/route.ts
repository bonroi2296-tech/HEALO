/**
 * ✅ P0 수정: 런타임 명시 (Node.js)
 * 
 * 이유:
 * - DB 관리자 접근 (SERVICE_ROLE_KEY 사용)
 * - Edge 런타임에서 발생할 수 있는 예측 불가 오류 방지
 */
export const runtime = "nodejs";

import { supabaseAdmin } from "../../../../src/lib/rag/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = String(body?.query || "").trim();
    const limit = Number(body?.limit || 10);
    const lang = body?.lang ? String(body.lang) : null;
    const sourceTypes = Array.isArray(body?.sourceTypes)
      ? body.sourceTypes
      : null;

    if (!query) {
      return Response.json(
        { ok: false, error: "query_required" },
        { status: 400 }
      );
    }

    const tokens = query
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/gi, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((t) => t.length >= 3)
      .slice(0, 6);

    const terms = tokens.length ? tokens : [query];
    const orFilter = terms.map((t) => `content.ilike.%${t}%`).join(",");

    let q = supabaseAdmin
      .from("rag_chunks")
      .select(
        "id, document_id, chunk_index, content, metadata, rag_documents!inner(id, source_type, source_id, lang, title)"
      )
      .or(orFilter)
      .limit(30);

    if (lang) q = q.eq("rag_documents.lang", lang);
    if (sourceTypes?.length)
      q = q.in("rag_documents.source_type", sourceTypes);

    const { data, error } = await q;
    if (error) throw error;

    const results = (data || []).map((row) => {
      const content = String(row.content || "").toLowerCase();
      const score = terms.reduce(
        (sum, t) => (content.includes(t.toLowerCase()) ? sum + 1 : sum),
        0
      );
      return { ...row, _score: score };
    });

    results.sort((a, b) => b._score - a._score);

    return Response.json({
      ok: true,
      results: results.slice(0, limit),
      scoring: "token match count over up to 6 tokens",
    });
  } catch (error: any) {
    return Response.json(
      { ok: false, error: error?.message || "search_failed" },
      { status: 500 }
    );
  }
}
