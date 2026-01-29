/**
 * HEALO: Supabase Browser Client (SSR-safe)
 * 
 * 목적:
 * - 브라우저(클라이언트)에서 사용하는 Supabase 클라이언트
 * - @supabase/ssr의 createBrowserClient 사용
 * - 쿠키 기반 세션 관리 (localStorage 대신)
 * - 싱글톤 패턴으로 "Multiple GoTrueClient instances" 경고 방지
 * 
 * 사용법:
 * ```ts
 * import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
 * 
 * const supabase = createSupabaseBrowserClient()
 * const { data, error } = await supabase.auth.signInWithPassword(...)
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// 싱글톤 인스턴스
let browserClient: SupabaseClient | null = null

/**
 * ✅ 브라우저용 Supabase 클라이언트 생성
 * 
 * @returns Supabase client
 */
export function createSupabaseBrowserClient(): SupabaseClient {
  // 싱글톤: 이미 생성되었으면 재사용
  if (browserClient) {
    return browserClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[supabase/browser] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    )
  }

  // @supabase/ssr의 createBrowserClient 사용
  // 이 클라이언트는 쿠키를 자동으로 관리합니다
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return browserClient
}

/**
 * ✅ 싱글톤 인스턴스 리셋 (테스트용)
 */
export function resetBrowserClient() {
  browserClient = null
}
