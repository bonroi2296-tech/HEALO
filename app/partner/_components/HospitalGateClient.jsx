"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function HospitalGateClient({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const { createSupabaseBrowserClient } = await import("../../../src/lib/supabase/browser");
        const supabase = createSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const headers = { "Content-Type": "application/json" };
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch("/api/partner/whoami", {
          credentials: "include",
          headers,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.isHospitalUser) {
            setHospitalInfo({
              hospitalId: result.hospitalId,
              hospitalName: result.hospitalName,
              role: result.role,
            });
            setIsAuthorized(true);
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("[HospitalGate] Error:", error);
        router.push("/login");
      } finally {
        setIsChecking(false);
      }
    };

    verify();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">병원 포털 접속 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <HospitalContext.Provider value={hospitalInfo}>{children}</HospitalContext.Provider>;
}

import { createContext, useContext } from "react";

const HospitalContext = createContext(null);

export function useHospitalContext() {
  return useContext(HospitalContext);
}
