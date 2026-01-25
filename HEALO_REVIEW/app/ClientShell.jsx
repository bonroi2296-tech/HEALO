"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "../src/lib/data/supabaseClient";
import { SITE_INFO } from "../src/lib/siteSettings";
import { getLangCodeFromCookie, t } from "../src/lib/i18n";
import { pageview } from "../src/lib/ga";
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
  const searchParams = useSearchParams();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState({ logo: "", hero: "" });
  const [langCode, setLangCode] = useState("en");

  useEffect(() => {
    setLangCode(getLangCodeFromCookie());
    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const { data } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    supabaseClient
      .from("site_settings")
      .select("*")
      .single()
      .then(({ data }) => {
        if (data) setSiteConfig({ logo: data.logo_url, hero: data.hero_background_url });
      });
    return () => {
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, []);

  const lastPageviewRef = useRef("");
  useEffect(() => {
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (lastPageviewRef.current === url) return;
    lastPageviewRef.current = url;
    pageview(url);
  }, [pathname, searchParams]);

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

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen relative">
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
      />

      <ErrorBoundary>
        <main className="pb-24">{children}</main>
      </ErrorBoundary>

      <footer className="bg-white border-t border-gray-100">
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
      </footer>

      {!hideBottomNav && (
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
