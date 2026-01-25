/**
 * HEALO: Referral Summary API
 * normalizedInquiryId → 병원 전달용 요약 (JSON + Markdown)
 */

import { NextRequest } from "next/server";
import {
  buildReferralSummaryJson,
  buildReferralSummaryMarkdown,
} from "../../../../src/lib/referral/buildReferralSummary";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const normalizedInquiryId = body?.normalizedInquiryId ? String(body.normalizedInquiryId) : null;

    if (!normalizedInquiryId) {
      return Response.json(
        { ok: false, error: "normalized_inquiry_id_required" },
        { status: 400 }
      );
    }

    const json = await buildReferralSummaryJson(normalizedInquiryId);
    if (!json) {
      return Response.json(
        { ok: false, error: "referral_summary_not_found" },
        { status: 404 }
      );
    }

    const markdown = buildReferralSummaryMarkdown(json);

    console.log("[api/referral/summary] success:", { normalizedInquiryId });
    return Response.json({
      ok: true,
      summaryJson: json,
      summaryMarkdown: markdown,
    });
  } catch (error: any) {
    console.error("[api/referral/summary] error:", error);
    return Response.json(
      { ok: false, error: error?.message || "summary_failed" },
      { status: 500 }
    );
  }
}
