/**
 * HEALO: Supabase Server Client (SSR-safe)
 * 
 * 목적:
 * - 서버(API Route, Server Component)에서 사용하는 Supabase 클라이언트
 * - @supabase/ssr의 createServerClient 사용
 * - Next.js cookies()를 통해 쿠키 읽기/쓰기
 * - Route Handler(/api/**)에서 세션 확인 가능
 * 
 * 사용법:
 * ```ts
 * import { createSupabaseServerClient } from '@/lib/supabase/server'
 * 
 * export async function GET(request: NextRequest) {
 *   const supabase = createSupabaseServerClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // ...
 * }
 * ```
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * ✅ 서버용 Supabase 클라이언트 생성 (쿠키 기반)
 * 
 * @returns Supabase client
 */
export function createSupabaseServerClient(): SupabaseClient {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[supabase/server] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    )
  }

  // @supabase/ssr의 createServerClient 사용
  // cookies()를 통해 Next.js와 통합
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Route Handler에서 set/remove는 실패할 수 있음 (읽기 전용)
          // middleware에서 쿠키 업데이트가 처리됨
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // Route Handler에서 set/remove는 실패할 수 있음
        }
      },
    },
  })
}
