import { ingestSources } from "../../../../src/lib/rag/ingest";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sourceTypes = Array.isArray(body?.sourceTypes)
      ? body.sourceTypes
      : undefined;
    const sourceId = body?.source_id ? String(body.source_id) : undefined;
    const results = await ingestSources(sourceTypes, sourceId);
    return Response.json({ ok: true, results });
  } catch (error: any) {
    return Response.json(
      { ok: false, error: error?.message || "ingest_failed" },
      { status: 500 }
    );
  }
}
