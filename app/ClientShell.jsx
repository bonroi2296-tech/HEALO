"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { supabaseClient } from "../src/lib/data/supabaseClient";
import { SITE_INFO } from "../src/lib/siteSettings";
import { getLangCodeFromCookie, t } from "../src/lib/i18n";
import {
  Header,
  MobileBottomNav,
  FloatingInquiryBtn,
} from "../src/components.jsx";
import ErrorBoundary from "../src/components/ErrorBoundary";
import { useToast } from "../src/components/Toast";

export default function ClientShell({ children }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  // useSearchParams 제거: 자동 새로고침 문제 해결
  // const searchParams = useSearchParams();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [isHospitalUser, setIsHospitalUser] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState({ logo: "", hero: "" });
  const [langCode, setLangCode] = useState('en');
  useEffect(() => { setLangCode(getLangCodeFromCookie()); }, []);

  useEffect(() => {
    console.log("[ClientShell] 🔍 Mounting, checking session...");
    
    let mounted = true;

    const checkHospitalUser = (accessToken) => {
      if (!accessToken) { setIsHospitalUser(false); return; }
      fetch("/api/partner/whoami", {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => { if (mounted) setIsHospitalUser(!!d.isHospitalUser); })
        .catch(() => { if (mounted) setIsHospitalUser(false); });
    };

    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          console.log("[ClientShell] ✅ Initial session:", session?.user?.email || "none");
          setSession(session);
          checkHospitalUser(session?.access_token);
        }
      });
      
    const { data } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          console.log("[ClientShell] 🔔 Auth state changed:", _event, session?.user?.email || "none");
          setSession(session);
          checkHospitalUser(session?.access_token);
        }
      }
    );
    
    supabaseClient
      .from("site_settings")
      .select("logo_url,hero_background_url")
      .single()
      .then(({ data }) => {
        if (mounted && data) {
          setSiteConfig({ logo: data.logo_url, hero: data.hero_background_url });
        }
      });
      
    return () => {
      mounted = false;
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, []);

  // pageview 추적 임시 비활성화: 자동 새로고침 문제 해결
  // const lastPageviewRef = useRef("");
  // useEffect(() => {
  //   if (lastPageviewRef.current === pathname) return;
  //   lastPageviewRef.current = pathname;
  //   pageview(pathname);
  // }, [pathname]);

  const handleSetView = (viewName) => {
    setIsMobileMenuOpen(false);
    switch (viewName) {
      case "home":
        router.push("/");
        break;
      case "admin":
        router.push("/admin");
        break;
      case "list_treatment":
        router.push("/treatments");
        break;
      case "list_hospital":
        router.push("/hospitals");
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
      case "success":
        router.push("/success");
        break;
      default:
        router.push("/");
    }
  };

  const handleNavClick = (targetView) => handleSetView(targetView);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    toast.success("Logged out successfully!");
    router.push("/");
  };

  const handleGlobalInquiry = () => {
    router.push("/inquiry");
    setIsMobileMenuOpen(false);
  };

  const getCurrentView = useMemo(() => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/treatments")) return "list_treatment";
    if (pathname.startsWith("/hospitals")) return "list_hospital";
    return "";
  }, [pathname]);

  const hideBottomNav = pathname.includes("success");
  const isPortalPage = pathname.startsWith("/admin") || pathname.startsWith("/partner");

  // --- Idle timeout (portal pages only, 10 min) ---
  const IDLE_LIMIT_MS = 10 * 60 * 1000;
  const WARNING_MS = 9 * 60 * 1000;
  const CHECK_INTERVAL_MS = 30 * 1000;
  const THROTTLE_MS = 1000;

  const lastActivityRef = useRef(Date.now());
  const warningShownRef = useRef(false);
  const throttleRef = useRef(0);

  const resetActivity = useCallback(() => {
    const now = Date.now();
    if (now - throttleRef.current < THROTTLE_MS) return;
    throttleRef.current = now;
    lastActivityRef.current = now;
    warningShownRef.current = false;
  }, []);

  useEffect(() => {
    if (!isPortalPage || !session) return;

    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetActivity, { passive: true }));

    const timer = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= IDLE_LIMIT_MS) {
        clearInterval(timer);
        events.forEach((e) => window.removeEventListener(e, resetActivity));
        supabaseClient.auth.signOut().then(() => {
          toast.error("보안을 위해 자동 로그아웃되었습니다.");
          router.push("/login");
        });
        return;
      }
      if (idle >= WARNING_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning("1분 후 자동 로그아웃됩니다. 활동을 계속하세요.");
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, resetActivity));
    };
  }, [isPortalPage, session, resetActivity, router, toast]);

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen relative">
      {isPortalPage ? (
        <PortalTopBar session={session} onLogout={handleLogout} siteConfig={siteConfig} />
      ) : (
        <Header
          setView={handleSetView}
          view={getCurrentView}
          handleGlobalInquiry={handleGlobalInquiry}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onNavClick={handleNavClick}
          session={session}
          onLogout={handleLogout}
          siteConfig={siteConfig}
          isHospitalUser={isHospitalUser}
        />
      )}

      <ErrorBoundary>
        <main className={isPortalPage ? "" : "pb-24"}>{children}</main>
      </ErrorBoundary>

      {!isPortalPage && <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-gray-900 font-bold">{SITE_INFO.brand.name}</div>
              <div className="text-xs text-gray-500 mt-2">
                {SITE_INFO.brand.tagline}
              </div>
            </div>
            <div>
              <div className="text-gray-900 font-semibold mb-2">
                {t("footer.company", langCode)}
              </div>
              <ul className="space-y-1">
                {SITE_INFO.navigation.company.map((item) => (
                  <li key={item.href}>
                    <a className="hover:text-teal-600" href={item.href}>
                      {t(item.labelKey, langCode)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-gray-900 font-semibold mb-2">
                {t("footer.legal", langCode)}
              </div>
              <ul className="space-y-1">
                {SITE_INFO.navigation.legal.map((item) => (
                  <li key={item.href}>
                    <a className="hover:text-teal-600" href={item.href}>
                      {t(item.labelKey, langCode)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-1">
            <div>Service Name: {SITE_INFO.legal.serviceName}</div>
            <div>Operated by: {SITE_INFO.legal.operatedBy}</div>
            <div>Business Type: {SITE_INFO.legal.businessType}</div>
            <div>Representative: {SITE_INFO.legal.representative}</div>
            <div>
              Business Registration Number:{" "}
              {SITE_INFO.legal.businessRegistrationNumber}
            </div>
            <div>
              Foreign Patient Attraction Business Registration:{" "}
              {SITE_INFO.legal.foreignPatientAttractionRegistration}
            </div>
            <div>
              Address: {SITE_INFO.legal.addressLine1}{" "}
              {SITE_INFO.legal.addressLine2}
            </div>
            <div>Contact Email: {SITE_INFO.legal.contactEmail}</div>
            <div>
              Personal Information Protection Officer:{" "}
              {SITE_INFO.legal.privacyOfficer}
            </div>
            <div className="pt-2">{SITE_INFO.legal.copyright}</div>
          </div>
        </div>
      </footer>}

      {!hideBottomNav && !isPortalPage && (
        <>
          <MobileBottomNav
            setView={handleSetView}
            view={getCurrentView}
            onInquiry={handleGlobalInquiry}
            onNavClick={handleNavClick}
          />
          <div className="hidden md:block">
            <FloatingInquiryBtn onClick={handleGlobalInquiry} />
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Portal Top Bar — slim header for admin/hospital pages
   ────────────────────────────────────────────── */
function PortalTopBar({ session, onLogout, siteConfig }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        {siteConfig?.logo ? (
          <img src={siteConfig.logo} alt="HEALO" className="h-7 w-auto" />
        ) : (
          <span className="text-lg font-bold text-teal-600">HEALO</span>
        )}
      </Link>

      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1 text-gray-500 hover:text-teal-600 transition-colors"
        >
          <ExternalLink size={14} />
          <span>메인 사이트</span>
        </Link>

        {session?.user?.email && (
          <span className="hidden md:block text-gray-400 truncate max-w-[180px]">
            {session.user.email}
          </span>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors ml-1"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}
