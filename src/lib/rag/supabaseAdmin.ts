import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 빌드 시점에는 환경 변수가 없을 수 있으므로, 런타임에서만 체크
// 빌드 시점 체크를 건너뛰기 위해 조건부 초기화
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  // 이미 초기화되었으면 재사용
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // 환경 변수 체크 (런타임에서만 실행됨)
  if (!supabaseUrl || !serviceKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL/VITE_SUPABASE_URL");
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(`Supabase admin env missing: ${missing.join(", ")}`);
  }

  // 클라이언트 생성
  supabaseAdminInstance = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  return supabaseAdminInstance;
}

// Proxy를 사용하여 런타임에만 초기화 (빌드 시점에는 에러 발생하지 않음)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const admin = getSupabaseAdmin();
    const value = admin[prop as keyof typeof admin];
    // 함수인 경우 this 바인딩 유지
    if (typeof value === 'function') {
      return value.bind(admin);
    }
    return value;
  },
});
