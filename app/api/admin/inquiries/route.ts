/**
 * HEALO: 관리자 문의 조회 API
 * 
 * 경로: /api/admin/inquiries
 * 권한: 관리자 전용
 * 
 * 목적:
 * - 관리자가 문의 목록을 조회할 때 PII를 복호화하여 표시
 * - DB에는 암호화된 상태로 유지
 * - 복호화는 서버에서만 수행
 * 
 * 보안:
 * - 관리자 권한 확인 필수
 * - 복호화된 평문은 네트워크 응답에만 포함
 * - 로그에 평문 출력 금지
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { supabaseAdmin, assertSupabaseEnv } from "../../../../src/lib/rag/supabaseAdmin";
import { checkAdminAuth } from "../../../../src/lib/auth/checkAdminAuth";
import { decryptInquiriesForAdmin } from "../../../../src/lib/security/decryptForAdmin";
import { maskEmail, maskPhone } from "../../../../src/lib/security/encryptionV2";

/**
 * GET: 문의 목록 조회 (관리자 전용, PII 복호화)
 * 
 * Query Parameters:
 * - limit: 조회 개수 (기본: 50, 최대: 200)
 * - offset: 오프셋 (페이지네이션용)
 * - status: 상태 필터 (received / normalized / error / blocked)
 * - treatment_type: 시술 타입 필터
 * - nationality: 국가 필터
 * - decrypt: 복호화 여부 (true/false, 기본: true)
 * 
 * Response:
 * {
 *   ok: true,
 *   inquiries: [...],
 *   total: 100,
 *   decrypted: true
 * }
 */
export async function GET(request: NextRequest) {
  // ✅ 환경변수 검증
  assertSupabaseEnv();

  // ========================================
  // 1. 관리자 권한 확인 (Bearer 토큰 우선, 쿠키 fallback)
  // ========================================
  const authResult = await checkAdminAuth(request);

  if (!authResult.isAdmin) {
    console.warn(`[admin/inquiries] Unauthorized access attempt: ${authResult.error}`, authResult.debug);
    
    const response: any = {
      ok: false,
      error: "unauthorized",
      detail: "관리자 권한이 필요합니다",
    };

    // 개발 환경에서만 debug 정보 포함
    if (process.env.NODE_ENV !== "production" && authResult.debug) {
      response.debug = authResult.debug;
    }

    return Response.json(response, { status: 403 });
  }

  console.log(`[admin/inquiries] Admin access: ${authResult.email} (reason: ${authResult.reason})`);

  // ========================================
  // 2. Query Parameters 파싱
  // ========================================
  const { searchParams } = new URL(request.url);

  const limit = Math.min(
    parseInt(searchParams.get("limit") || "50"),
    200 // 최대 200건
  );
  const offset = parseInt(searchParams.get("offset") || "0");
  const statusFilter = searchParams.get("status");
  const treatmentTypeFilter = searchParams.get("treatment_type");
  const nationalityFilter = searchParams.get("nationality");
  const shouldDecrypt = searchParams.get("decrypt") !== "false"; // 기본: true

  // ========================================
  // 3. DB 조회
  // ========================================
  try {
    let query = supabaseAdmin
      .from("inquiries")
      .select("*", { count: "exact" })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    // 필터 적용
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }
    if (treatmentTypeFilter) {
      query = query.eq("treatment_type", treatmentTypeFilter);
    }
    if (nationalityFilter) {
      query = query.eq("nationality", nationalityFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[admin/inquiries] DB query error:", error);
      return Response.json(
        {
          ok: false,
          error: "db_query_failed",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    // ========================================
    // 4. PII 복호화 (관리자만)
    // ========================================
    let inquiries = data || [];

    if (shouldDecrypt && inquiries.length > 0) {
      try {
        inquiries = await decryptInquiriesForAdmin(inquiries);
        console.log(`[admin/inquiries] Decrypted ${inquiries.length} inquiries`);
      } catch (decryptError: any) {
        console.error("[admin/inquiries] Decryption error:", decryptError.message);
        // Fail-safe: 복호화 실패해도 응답은 반환 (암호문 상태로)
      }
    }

    // ========================================
    // 5. 응답 반환
    // ========================================
    return Response.json({
      ok: true,
      inquiries,
      total: count || 0,
      limit,
      offset,
      decrypted: shouldDecrypt,
    });
  } catch (error: any) {
    console.error("[admin/inquiries] Error:", error);
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
