"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * AdminGateClient: Admin 권한 확인 컴포넌트
 * - /api/admin/whoami 호출하여 admin 권한 체크
 * - 권한 없으면 /login으로 리다이렉트
 * - Middleware와 함께 이중 방어선 역할
 */
export function AdminGateClient({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // ✅ Supabase 세션에서 access token 가져오기
        const { createSupabaseBrowserClient } = await import('../../../src/lib/supabase/browser');
        const supabase = createSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        
        console.log('[AdminGate] Checking admin access, token:', accessToken ? '✅' : '❌');
        
        // ✅ Bearer token으로 권한 확인
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        const response = await fetch('/api/admin/whoami', {
          credentials: 'include',
          headers,
        });
        
        if (response.ok) {
          const result = await response.json();
          
          console.log('[AdminGate] whoami result:', {
            isAdmin: result.isAdmin,
            email: result.email,
            reason: result.reason,
            authMethod: result.authMethod,
            error: result.error
          });
          
          if (result.isAdmin) {
            setIsAuthorized(true);
          } else {
            console.warn('[AdminGate] ❌ Not an admin:', {
              email: result.email,
              error: result.error,
              reason: result.reason
            });
            console.warn('[AdminGate] 💡 Tip: Add your email to ADMIN_EMAIL_ALLOWLIST environment variable');
            router.push('/login');
          }
        } else {
          const errBody = await response.json().catch(() => ({}));
          console.warn('[AdminGate] Auth check failed, status:', response.status, errBody?.hint ? `— ${errBody.hint}` : '');
          router.push('/login');
        }
      } catch (error) {
        console.error('[AdminGate] Verification error:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAdmin();
  }, [router]);

  // 권한 확인 중이면 로딩 표시
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // 권한 없으면 아무것도 렌더링하지 않음 (redirect 진행 중)
  if (!isAuthorized) {
    return null;
  }

  // ✅ 권한 확인됨: children 렌더링
  return <>{children}</>;
}
