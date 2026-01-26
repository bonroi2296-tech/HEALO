// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// 빌드 시점에는 환경 변수가 없을 수 있으므로, 런타임에서만 체크
let supabaseInstance = null;

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경 변수 검증 (런타임에서만 실행)
  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    throw new Error(
      `❌ Supabase 환경 변수가 설정되지 않았습니다!\n` +
      `누락된 변수: ${missing.join(', ')}\n` +
      `프로젝트 루트에 .env.local 파일을 생성하고 다음을 추가하세요:\n` +
      `NEXT_PUBLIC_SUPABASE_URL=your_url\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key`
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseInstance;
}

// Proxy를 사용하여 런타임에만 초기화 (빌드 시점에는 에러 발생하지 않음)
export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop];
    // 함수인 경우 this 바인딩 유지
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});