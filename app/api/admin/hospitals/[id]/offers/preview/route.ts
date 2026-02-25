/**
 * HOSPITAL_OFFER_IMPORT_V1: 대표 시술 3개 미리보기 (DB 반영 없음)
 * GET or POST /api/admin/hospitals/[id]/offers/preview
 */

export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest } from "next/server";
import { supabaseAdmin, assertSupabaseEnv } from "../../../../../../../src/lib/rag/supabaseAdmin";
import { requireAdminAuth } from "../../../../../../../src/lib/auth/requireAdminAuth";
import { crawlHospitalWebsite } from "../../../../../../../src/lib/hospitalOffers/crawlPipeline";
import { extractOffersFromText } from "../../../../../../../src/lib/hospitalOffers/extractOffersLLM";
import type { OffersPreviewPayload } from "../../../../../../../src/lib/hospitalOffers/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return runPreview(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return runPreview(request, params);
}

async function runPreview(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  assertSupabaseEnv();
  const auth = await requireAdminAuth(request);
  if (!auth.success) return auth.response;
  const { id: hospitalId } = await params;
  if (!hospitalId) {
    return Response.json({ ok: false, error: "missing_hospital_id" }, { status: 400 });
  }

  const { data: hospital, error: hospitalError } = await supabaseAdmin
    .from("hospitals")
    .select("id, website")
    .eq("id", hospitalId)
    .single();

  if (hospitalError || !hospital) {
    return Response.json(
      { ok: false, error: "hospital_not_found", detail: hospitalError?.message },
      { status: 404 }
    );
  }

  const website = (hospital.website || "").trim();
  const captured_at = new Date().toISOString();

  if (!website) {
    const payload: OffersPreviewPayload = {
      hospital_id: hospitalId,
      captured_at,
      sources: [],
      offers: [],
    };
    return Response.json({ ok: true, ...payload });
  }

  const crawl = await crawlHospitalWebsite(website);
  const sourceUrls = crawl.sources.map((s) => s.url);
  const offers = await extractOffersFromText(crawl.combinedText, sourceUrls);

  const payload: OffersPreviewPayload = {
    hospital_id: hospitalId,
    captured_at,
    sources: crawl.sources,
    offers: offers.slice(0, 3),
  };

  return Response.json({ ok: true, ...payload });
}
