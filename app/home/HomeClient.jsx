"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeroSection,
  CardListSection,
  PersonalConciergeCTA,
} from "../../src/components.jsx";

export default function HomeClient({
  featuredTreatments = [],
  featuredHospitals = [],
  siteConfig = { logo: "", hero: "" },
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

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

      <div className="mt-4 md:mt-10">
        <PersonalConciergeCTA onClick={() => router.push("/inquiry")} />
      </div>
    </>
  );
}
