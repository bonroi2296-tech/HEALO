"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPage } from "../../src/AdminPage";

/**
 * ⚠️ Admin 페이지는 middleware에서 서버 레벨 보호됨
 * 
 * 이 컴포넌트의 client-side 체크는 추가 방어선입니다.
 * - Middleware가 먼저 실행되어 unauthorized 접근 차단
 * - 여기서는 예외적으로 통과한 경우만 처리
 */
export default function AdminWrapper() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // ✅ Client-side 추가 방어: admin 권한 재확인
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch('/api/admin/whoami', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.isAdmin) {
            setIsAuthorized(true);
          } else {
            console.warn('[AdminWrapper] Client-side: Not an admin, redirecting to login');
            router.push('/login');
          }
        } else {
          console.warn('[AdminWrapper] Client-side: Auth check failed, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('[AdminWrapper] Client-side: Verification error:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAdmin();
  }, [router]);

  const setView = useMemo(
    () => (viewName) => {
      switch (viewName) {
        case "home":
          router.push("/");
          break;
        case "list_treatment":
          router.push("/treatments");
          break;
        case "list_hospital":
          router.push("/hospitals");
          break;
        case "admin":
          router.push("/admin");
          break;
        case "inquiry":
          router.push("/inquiry");
          break;
        case "login":
          router.push("/login");
          break;
        case "signup":
          router.push("/signup");
          break;
        default:
          router.push("/");
      }
    },
    [router]
  );

  // 권한 확인 중이면 로딩 표시
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // 권한 없으면 아무것도 렌더링하지 않음 (redirect 진행 중)
  if (!isAuthorized) {
    return null;
  }

  // ✅ 권한 확인됨: Admin UI 렌더링
  return <AdminPage setView={setView} />;
}
