"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * HEALO: Analytics 래퍼
 * 
 * 목적:
 * - 개발환경에서 GTM 로딩 방지
 * - /admin 경로에서 GTM 로딩 방지
 * - 프로덕션 + 일반 경로에서만 GTM 로드
 */
export default function AnalyticsWrapper() {
  const pathname = usePathname();
  const [shouldLoadGTM, setShouldLoadGTM] = useState(false);

  useEffect(() => {
    // 조건 확인
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    const isProduction = process.env.NODE_ENV === "production";
    const isAdminPath = pathname?.startsWith("/admin");

    // GTM 로드 조건:
    // 1. GA ID가 설정되어 있음
    // 2. 프로덕션 환경
    // 3. /admin 경로가 아님
    const shouldLoad = Boolean(gaId) && isProduction && !isAdminPath;

    if (shouldLoad !== shouldLoadGTM) {
      setShouldLoadGTM(shouldLoad);
    }

    // 디버그 로그 (개발 환경에서만)
    if (!isProduction) {
      console.log("[Analytics] GTM 로딩 조건:", {
        gaId: gaId ? "설정됨" : "미설정",
        isProduction,
        isAdminPath,
        shouldLoad,
      });
    }
  }, [pathname, shouldLoadGTM]);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!shouldLoadGTM || !gaId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: false });`}
      </Script>
    </>
  );
}
