// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// 1. Project URL (Next.js public env only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// 2. Publishable Key (Next.js public env only)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 검증 (프로덕션 배포 전 필수)
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

export const supabase = createClient(supabaseUrl, supabaseKey);