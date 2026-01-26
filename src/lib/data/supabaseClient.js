"use client";

import { createClient } from "@supabase/supabase-js";

// 런타임에만 초기화 (빌드 시점에는 에러 발생하지 않음)
// 환경 변수가 있으면 즉시 초기화, 없으면 나중에 초기화
let supabaseClientInstance = null;

function initSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // 빌드 시점에는 더미 클라이언트 반환
    if (typeof window === 'undefined') {
      return createDummySupabaseClient();
    }
    // 런타임에는 에러
    throw new Error(`Supabase environment variables are missing: ${!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : ''} ${!supabaseKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''}`);
  }

  supabaseClientInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseClientInstance;
}

// 더미 클라이언트 (빌드 시점용)
function createDummySupabaseClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}

// Proxy를 사용하여 런타임에만 초기화
export const supabaseClient = new Proxy({}, {
  get(_target, prop) {
    const client = initSupabaseClient();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
