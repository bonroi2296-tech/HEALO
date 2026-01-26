"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data: settingsData } = await supabaseClient
        .from("site_settings")
        .select("*")
        .single();
      if (settingsData) {
        setSiteConfig({
          logo: settingsData.logo_url,
          hero: settingsData.hero_background_url,
        });
      }
      const locCol = getLocationColumn();

      const { data: tData, error: tError } = await supabaseClient
        .from("treatments")
        .select(`*, hospitals(slug, name, location:${locCol})`)
        .eq("is_published", true)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(4);

      if (tError) {
        console.error("[HomeClient] Treatments fetch error:", tError);
        setTreatmentsError(tError);
      } else {
        setTreatmentsError(null);
        if (tData)
          setFeaturedTreatments(tData.map(mapTreatmentRow).filter(Boolean));
      }

      const { data: hData, error: hError } = await supabaseClient
        .from("hospitals")
        .select(`*, location:${locCol}`)
        .eq("is_published", true)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(4);

      if (hError) {
        console.error("[HomeClient] Hospitals fetch error:", hError);
        setHospitalsError(hError);
      } else {
        setHospitalsError(null);
        if (hData)
          setFeaturedHospitals(hData.map(mapHospitalRow).filter(Boolean));
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
  );
}
