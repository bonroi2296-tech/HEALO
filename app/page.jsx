import HomeClient from "./home/HomeClient";
import ErrorBoundary from "../src/components/ErrorBoundary";
import { getFeaturedTreatments } from "../src/lib/data/treatments";
import { getFeaturedHospitals } from "../src/lib/data/hospitals";
import { supabaseServer } from "../src/lib/data/supabaseServer";

export const metadata = {
  title: "HEALO | Korea's #1 Medical Concierge",
  description:
    "Find the best clinics in Korea. AI-powered comparison of treatments, doctors, and prices. Free personalized treatment plans.",
  openGraph: {
    title: "HEALO | Korea's #1 Medical Concierge",
    description:
      "Find the best clinics in Korea. AI-powered comparison of treatments, doctors, and prices.",
    type: "website",
  },
};

async function getSiteConfig() {
  try {
    const { data } = await supabaseServer
      .from("site_settings")
      .select("*")
      .single();
    if (data) {
      return { logo: data.logo_url, hero: data.hero_background_url };
    }
  } catch (err) {
    console.error("[HomePage] Site settings fetch error:", err);
  }
  return { logo: "", hero: "" };
}

export default async function HomePage() {
  const [featuredTreatments, featuredHospitals, siteConfig] = await Promise.all([
    getFeaturedTreatments(4),
    getFeaturedHospitals(4),
    getSiteConfig(),
  ]);

  return (
    <ErrorBoundary>
      <HomeClient
        featuredTreatments={featuredTreatments}
        featuredHospitals={featuredHospitals}
        siteConfig={siteConfig}
      />
    </ErrorBoundary>
  );
}
