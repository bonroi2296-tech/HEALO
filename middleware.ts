/**
 * HEALO: Next.js Middleware (Production)
 * 
 * 목적:
 * - Supabase SSR 기반 인증 시스템
 * - 쿠키 동기화 (클라이언트 ↔ 서버)
 * - /admin 경로 보호 (로그인 필수)
 * - /api/admin/* API 보호
 * 
 * 중요:
 * - 모든 요청에서 쿠키를 동기화하여 서버가 세션을 읽을 수 있게 함
 * - createServerClient가 자동으로 쿠키를 업데이트함
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // ✅ 중요: getUser() 호출로 세션 새로고침 및 쿠키 동기화
  const { data: { user }, error } = await supabase.auth.getUser()

  // 디버그 로그 (개발 환경)
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Middleware]', request.nextUrl.pathname, 'user:', user?.email || 'none', 'error:', error?.message || 'none')
  }

  // 보호된 경로 설정 (/admin, /api/admin)
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin')

  if ((isAdminPath || isAdminApi) && !user) {
    if (isAdminApi) {
      // API는 401 반환 (리다이렉트 안 함)
      return NextResponse.json(
        { ok: false, error: 'unauthorized', detail: '로그인이 필요합니다' },
        { status: 401 }
      )
    }
    // 페이지는 /login으로 리다이렉트
    console.log('[Middleware] Redirecting to /login: no user')
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // 로그인 된 상태에서 로그인 페이지 접근 시 리다이렉트
  if (request.nextUrl.pathname === '/login' && user) {
    console.log('[Middleware] Redirecting to /admin: user logged in')
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
