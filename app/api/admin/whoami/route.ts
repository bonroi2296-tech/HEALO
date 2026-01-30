/**
 * HEALO: 관리자 진단 엔드포인트
 * 
 * 경로: /api/admin/whoami
 * 권한: 없음 (진단용이므로 누구나 자신의 상태 확인 가능)
 * Rate Limit: 제외 (빠른 디버깅을 위해)
 * 
 * 목적:
 * - 현재 로그인 상태 확인
 * - 관리자 권한 판정 이유 확인
 * - 쿠키/세션 디버깅용
 */

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { checkAdminAuth } from "../../../../src/lib/auth/checkAdminAuth";

// ⚠️ 주의: 이 API는 rate limit을 적용하지 않습니다 (진단용)

/**
 * GET: 현재 유저 정보 및 관리자 권한 확인
 * 
 * Response:
 * {
 *   isAdmin: boolean,
 *   email: string,
 *   reason: string,
 *   debug: object (개발 환경만)
 * }
 */
export async function GET(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  
  // 관리자 권한 체크 (진단용이므로 실패해도 정보 반환)
  const authResult = await checkAdminAuth(request);

  // 기본 응답
  const response: any = {
    isAdmin: authResult.isAdmin,
    email: authResult.email || null,
    userId: authResult.userId || null,
    reason: authResult.reason || null,
    error: authResult.error || null,
  };

  // 개발 환경에서만 debug 정보 포함
  if (isDev) {
    response.debug = authResult.debug || {};
    
    // 추가 디버그 정보
    response.debug.url = request.url;
    response.debug.method = request.method;
    response.debug.envVars = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasAdminAllowlist: !!process.env.ADMIN_EMAIL_ALLOWLIST,
      allowlistValue: process.env.ADMIN_EMAIL_ALLOWLIST || null,
    };
  }

  return Response.json(response);
}
