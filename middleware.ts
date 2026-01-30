/**
 * HEALO: Next.js Middleware (서버 레벨 보호)
 * 
 * 목적:
 * - /admin 경로를 서버 레벨에서 보호
 * - Admin 권한이 없으면 /login으로 redirect
 * - Client-side 체크 전에 실행되어 UI 노출 차단
 * 
 * 실행 순서:
 * 1. Middleware (서버) ← 여기서 먼저 차단
 * 2. Server Component
 * 3. Client Component
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * ✅ Middleware에서 admin 권한 체크
 * 
 * 판정 기준:
 * 1. user.user_metadata.role === "admin"
 * 2. user.app_metadata.role === "admin"
 * 3. ADMIN_EMAIL_ALLOWLIST에 포함된 이메일
 */
async function checkAdminInMiddleware(request: NextRequest): Promise<{
  isAdmin: boolean;
  email?: string;
}> {
  try {
    // Supabase 클라이언트 생성 (middleware용)
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // 세션 확인
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { isAdmin: false };
    }

    const userEmail = user.email?.trim().toLowerCase();

    // 1. user_metadata.role === "admin"
    if (user.user_metadata?.role === "admin") {
      return { isAdmin: true, email: userEmail };
    }

    // 2. app_metadata.role === "admin"
    if (user.app_metadata?.role === "admin") {
      return { isAdmin: true, email: userEmail };
    }

    // 3. ADMIN_EMAIL_ALLOWLIST 체크
    const allowlistEnv = process.env.ADMIN_EMAIL_ALLOWLIST;
    if (allowlistEnv && userEmail) {
      const allowlist = allowlistEnv
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);

      if (allowlist.includes(userEmail)) {
        return { isAdmin: true, email: userEmail };
      }
    }

    // ❌ Admin 권한 없음
    return { isAdmin: false, email: userEmail };
  } catch (error: any) {
    console.error("[middleware] Admin check error:", error.message);
    return { isAdmin: false };
  }
}

/**
 * ✅ Middleware 실행
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 예외 경로: 인증 없이 통과
  // ========================================
  const publicPaths = [
    "/login",
    "/signup",
    "/auth/callback", // ⚠️ OAuth 콜백 예외 처리 (필수)
    "/api",
  ];

  // 예외 경로는 middleware 건너뛰기
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ========================================
  // /admin 경로 보호 (서버 레벨)
  // ========================================
  if (pathname.startsWith("/admin")) {
    // /admin/whoami는 진단용이므로 제외 (누구나 접근 가능)
    if (pathname === "/admin/whoami") {
      return NextResponse.next();
    }

    // Admin 권한 체크
    const { isAdmin, email } = await checkAdminInMiddleware(request);

    if (!isAdmin) {
      console.warn(
        `[middleware] ❌ Unauthorized admin access blocked: ${pathname} | email: ${email || "none"}`
      );

      // /login으로 redirect
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname); // 원래 가려던 경로 저장
      return NextResponse.redirect(loginUrl);
    }

    console.log(
      `[middleware] ✅ Admin access granted: ${pathname} | email: ${email}`
    );
  }

  return NextResponse.next();
}

/**
 * ✅ Middleware 적용 경로
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
