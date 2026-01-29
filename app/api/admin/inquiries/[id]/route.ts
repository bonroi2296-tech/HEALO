/**
 * HEALO: 관리자 문의 상세 조회 API
 * 
 * 경로: /api/admin/inquiries/[id]
 * 권한: 관리자 전용
 * 
 * 목적:
 * - 관리자가 특정 문의의 상세 정보를 조회할 때 PII를 복호화하여 표시
 * - normalized_inquiries 정보도 함께 조회
 * - 복호화는 서버에서만 수행
 * 
 * 보안:
 * - 관리자 권한 확인 필수
 * - 복호화된 평문은 네트워크 응답에만 포함
 * - 로그에 평문 출력 금지
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { supabaseAdmin, assertSupabaseEnv } from "../../../../../src/lib/rag/supabaseAdmin";
import { checkAdminAuth } from "../../../../../src/lib/auth/checkAdminAuth";
import {
  decryptInquiryForAdmin,
  decryptNormalizedInquiryForAdmin,
} from "../../../../../src/lib/security/decryptForAdmin";

/**
 * GET: 문의 상세 조회 (관리자 전용, PII 복호화)
 * 
 * Path Parameters:
 * - id: 문의 ID
 * 
 * Query Parameters:
 * - decrypt: 복호화 여부 (true/false, 기본: true)
 * - include_normalized: normalized_inquiries 포함 여부 (true/false, 기본: true)
 * 
 * Response:
 * {
 *   ok: true,
 *   inquiry: {...},
 *   normalized: {...},
 *   decrypted: true
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ✅ 환경변수 검증
  assertSupabaseEnv();

  const inquiryId = parseInt(params.id);

  if (!inquiryId || isNaN(inquiryId)) {
    return Response.json(
      {
        ok: false,
        error: "invalid_inquiry_id",
        detail: "유효하지 않은 문의 ID입니다",
      },
      { status: 400 }
    );
  }

  // ========================================
  // 1. 관리자 권한 확인 (Bearer 토큰 우선, 쿠키 fallback)
  // ========================================
  const authResult = await checkAdminAuth(request);

  if (!authResult.isAdmin) {
    console.warn(
      `[admin/inquiries/${inquiryId}] Unauthorized access attempt: ${authResult.error}`
    );
    return Response.json(
      {
        ok: false,
        error: "unauthorized",
        detail: "관리자 권한이 필요합니다",
      },
      { status: 403 }
    );
  }

  console.log(`[admin/inquiries/${inquiryId}] Admin access: ${authResult.email}`);

  // ========================================
  // 2. Query Parameters 파싱
  // ========================================
  const { searchParams } = new URL(request.url);

  const shouldDecrypt = searchParams.get("decrypt") !== "false"; // 기본: true
  const includeNormalized = searchParams.get("include_normalized") !== "false"; // 기본: true

  // ========================================
  // 3. inquiry 조회
  // ========================================
  try {
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from("inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (inquiryError) {
      if (inquiryError.code === "PGRST116") {
        // Not found
        return Response.json(
          {
            ok: false,
            error: "inquiry_not_found",
            detail: "문의를 찾을 수 없습니다",
          },
          { status: 404 }
        );
      }

      console.error(`[admin/inquiries/${inquiryId}] DB query error:`, inquiryError);
      return Response.json(
        {
          ok: false,
          error: "db_query_failed",
          detail: inquiryError.message,
        },
        { status: 500 }
      );
    }

    // ========================================
    // 4. normalized_inquiries 조회 (옵션)
    // ========================================
    let normalized = null;

    if (includeNormalized) {
      const { data: normalizedData, error: normalizedError } = await supabaseAdmin
        .from("normalized_inquiries")
        .select("*")
        .eq("source_inquiry_id", inquiryId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (normalizedError) {
        console.error(
          `[admin/inquiries/${inquiryId}] normalized_inquiries query error:`,
          normalizedError
        );
        // Fail-safe: 에러가 나도 inquiry는 반환
      } else {
        normalized = normalizedData;
      }
    }

    // ========================================
    // 5. PII 복호화 (관리자만)
    // ========================================
    let decryptedInquiry = inquiry;
    let decryptedNormalized = normalized;

    if (shouldDecrypt) {
      try {
        decryptedInquiry = await decryptInquiryForAdmin(inquiry);
        console.log(`[admin/inquiries/${inquiryId}] Inquiry decrypted`);

        if (normalized) {
          decryptedNormalized = await decryptNormalizedInquiryForAdmin(normalized);
          console.log(`[admin/inquiries/${inquiryId}] Normalized inquiry decrypted`);
        }
      } catch (decryptError: any) {
        console.error(
          `[admin/inquiries/${inquiryId}] Decryption error:`,
          decryptError.message
        );
        // Fail-safe: 복호화 실패해도 응답은 반환 (암호문 상태로)
      }
    }

    // ========================================
    // 6. 응답 반환
    // ========================================
    return Response.json({
      ok: true,
      inquiry: decryptedInquiry,
      normalized: decryptedNormalized,
      decrypted: shouldDecrypt,
    });
  } catch (error: any) {
    console.error(`[admin/inquiries/${inquiryId}] Error:`, error);
    return Response.json(
      {
        ok: false,
        error: "internal_error",
        detail: error.message,
      },
      { status: 500 }
    );
  }
}
