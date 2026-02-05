"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  HeroSection,
  CardListSection,
  PersonalConciergeCTA,
} from "../../src/components.jsx";
import { supabaseClient } from "../../src/lib/data/supabaseClient";
import { mapHospitalRow, mapTreatmentRow } from "../../src/lib/mapper";
import { getLocationColumn } from "../../src/lib/language";

export default function HomeClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredTreatments, setFeaturedTreatments] = useState([]);
  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [siteConfig, setSiteConfig] = useState({ logo: "", hero: "" });
  const [treatmentsError, setTreatmentsError] = useState(null);
  const [hospitalsError, setHospitalsError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    const fetchFeatured = async () => {
      // ⏱️ 성능 측정 시작
      const perfStart = performance.now();
      const marks = {};

      try {
        setIsLoading(true);
        const locCol = getLocationColumn();

        // ✅ 최적화 1: Promise.all로 병렬 fetch (순차 → 병렬)
        marks.fetchStart = performance.now();
        
        const [settingsResult, treatmentsResult, hospitalsResult] = await Promise.all([
          supabaseClient.from("site_settings").select("*").single(),
          supabaseClient
            .from("treatments")
            .select(`*, hospitals(slug, name, location:${locCol})`)
            .eq("is_published", true)
            .order("display_order", { ascending: true, nullsFirst: false })
            .order("created_at", { ascending: false })
            .limit(4),
          supabaseClient
            .from("hospitals")
            .select(`*, location:${locCol}`)
            .eq("is_published", true)
            .order("display_order", { ascending: true, nullsFirst: false })
            .order("created_at", { ascending: false })
            .limit(4),
        ]);

        marks.fetchEnd = performance.now();

        // Site settings
        if (settingsResult.data) {
          setSiteConfig({
            logo: settingsResult.data.logo_url,
            hero: settingsResult.data.hero_background_url,
          });
        }

        // Treatments
        if (treatmentsResult.error) {
          console.error("[HomeClient] Treatments fetch error:", treatmentsResult.error);
          setTreatmentsError(treatmentsResult.error);
        } else {
          setTreatmentsError(null);
          if (treatmentsResult.data) {
            const mapped = treatmentsResult.data.map(mapTreatmentRow).filter(Boolean);
            setFeaturedTreatments(mapped);
            marks.treatmentsRendered = performance.now();
          }
        }

        // Hospitals
        if (hospitalsResult.error) {
          console.error("[HomeClient] Hospitals fetch error:", hospitalsResult.error);
          setHospitalsError(hospitalsResult.error);
        } else {
          setHospitalsError(null);
          if (hospitalsResult.data) {
            const mapped = hospitalsResult.data.map(mapHospitalRow).filter(Boolean);
            setFeaturedHospitals(mapped);
            marks.hospitalsRendered = performance.now();
          }
        }

        const perfEnd = performance.now();

        // 📊 성능 측정 로그
        if (isDev) {
          console.log("🚀 [Performance] Home Page Load:");
          console.log(`  - Total fetch time: ${(marks.fetchEnd - marks.fetchStart).toFixed(0)}ms`);
          console.log(`  - Data to render: ${(perfEnd - marks.fetchEnd).toFixed(0)}ms`);
          console.log(`  - Total: ${(perfEnd - perfStart).toFixed(0)}ms`);
        }
      } catch (error) {
        console.error("[HomeClient] Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <>
      <HeroSection
        setView={() => router.push("/treatments")}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        siteConfig={siteConfig}
      />

      {/* ✅ 최적화 2: 로딩 중 Skeleton UI */}
      {isLoading ? (
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-56"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-56"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <CardListSection
              title="HEALO's Signature Collection"
              items={featuredTreatments}
              onCardClick={(id) => {
                const item = featuredTreatments.find((entry) => entry.id === id);
                const slugOrId = item?.slug || item?.id || id;
                router.push(`/treatments/${slugOrId}`);
              }}
              type="treatment"
            />
            {isDev && (
              <div className="max-w-6xl mx-auto px-4 mt-2">
                {featuredTreatments.length === 0 && !treatmentsError && (
                  <p className="text-xs text-gray-500">No treatments loaded</p>
                )}
                {treatmentsError && (
                  <p className="text-xs text-red-500">
                    Error: {treatmentsError.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <CardListSection
            title="Official Medical Partners"
            items={featuredHospitals}
            onCardClick={(id) => {
              const item = featuredHospitals.find((entry) => entry.id === id);
              const slugOrId = item?.slug || item?.id || id;
              router.push(`/hospitals/${slugOrId}`);
            }}
            type="hospital"
          />
          {isDev && (
            <div className="max-w-6xl mx-auto px-4 mt-2">
              {featuredHospitals.length === 0 && !hospitalsError && (
                <p className="text-xs text-gray-500">No hospitals loaded</p>
              )}
              {hospitalsError && (
                <p className="text-xs text-red-500">
                  Error: {hospitalsError.message}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 md:mt-10">
            <PersonalConciergeCTA onClick={() => router.push("/inquiry")} />
          </div>
        </>
      )}
    </>
  );
}
