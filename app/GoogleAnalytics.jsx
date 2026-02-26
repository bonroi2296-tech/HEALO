"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "healo_cookie_consent";

export default function GoogleAnalytics({ gaId }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      try {
        setEnabled(localStorage.getItem(STORAGE_KEY) === "all");
      } catch {
        setEnabled(false);
      }
    };

    checkConsent();
    window.addEventListener("cookie-consent-change", checkConsent);
    return () =>
      window.removeEventListener("cookie-consent-change", checkConsent);
  }, []);

  if (!enabled || !gaId) return null;

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
