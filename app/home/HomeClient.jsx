"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Search, FileText, ChevronDown } from "lucide-react";
import {
  HeroSection,
  CardListSection,
  PersonalConciergeCTA,
} from "../../src/components.jsx";
import { getLangCodeFromCookie, t } from "../../src/lib/i18n";

const useLangCode = () => {
  const [langCode, setLangCode] = useState("en");
  useEffect(() => {
    setLangCode(getLangCodeFromCookie());
  }, []);
  return langCode;
};

function SocialProofSection({ langCode }) {
  const stats = [
    { value: "500+", labelKey: "social.consultations" },
    { value: "50+", labelKey: "social.partnerHospitals" },
    { value: "15+", labelKey: "social.specialties" },
    { value: "24h", labelKey: "social.responseTime" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-center text-sm text-gray-500">
        {stats.map((s) => (
          <div key={s.labelKey}>
            <span className="block text-2xl font-bold text-gray-900">
              {s.value}
            </span>
            {t(s.labelKey, langCode)}
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection({ langCode, onGetStarted }) {
  const steps = [
    {
      icon: MessageSquare,
      titleKey: "howItWorks.step1.title",
      descKey: "howItWorks.step1.desc",
    },
    {
      icon: Search,
      titleKey: "howItWorks.step2.title",
      descKey: "howItWorks.step2.desc",
    },
    {
      icon: FileText,
      titleKey: "howItWorks.step3.title",
      descKey: "howItWorks.step3.desc",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 text-center mb-8 md:mb-12">
        {t("howItWorks.title", langCode)}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {steps.map((step, i) => (
          <div key={step.titleKey} className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-500 text-teal-600 flex items-center justify-center mb-4">
              <step.icon size={24} />
            </div>
            <span className="text-xs font-bold text-teal-600 mb-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
              {t(step.titleKey, langCode)}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {t(step.descKey, langCode)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={onGetStarted}
          className="bg-teal-600 text-white px-8 py-3.5 rounded-full font-bold text-sm md:text-base hover:bg-teal-700 transition shadow-lg"
        >
          {t("cta.getFreePlan", langCode)}
        </button>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm md:text-base font-semibold text-gray-900">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 ml-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

function FAQSection({ langCode }) {
  const faqs = [
    { qKey: "faq.q1", aKey: "faq.a1" },
    { qKey: "faq.q2", aKey: "faq.a2" },
    { qKey: "faq.q3", aKey: "faq.a3" },
    { qKey: "faq.q4", aKey: "faq.a4" },
  ];

  return (
    <section className="max-w-3xl mx-auto px-4 py-10 md:py-16">
      <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 text-center mb-8">
        {t("faq.title", langCode)}
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 px-4 md:px-6">
        {faqs.map((faq) => (
          <FAQItem
            key={faq.qKey}
            question={t(faq.qKey, langCode)}
            answer={t(faq.aKey, langCode)}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomeClient({
  featuredTreatments = [],
  featuredHospitals = [],
  siteConfig = { logo: "", hero: "" },
}) {
  const router = useRouter();
  const langCode = useLangCode();
  const [searchTerm, setSearchTerm] = useState("");

  const goToInquiry = () => router.push("/inquiry");

  return (
    <>
      <HeroSection
        setView={() => router.push("/treatments")}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        siteConfig={siteConfig}
      />

      <SocialProofSection langCode={langCode} />

      <div className="px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm py-3 md:hidden text-center">
            <button
              onClick={goToInquiry}
              className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-teal-700 transition w-full max-w-xs"
            >
              {t("cta.getFreePlan", langCode)}
            </button>
          </div>
        </div>
      </div>

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

      <HowItWorksSection langCode={langCode} onGetStarted={goToInquiry} />

      <div className="mt-4 md:mt-10">
        <PersonalConciergeCTA onClick={goToInquiry} />
      </div>

      <FAQSection langCode={langCode} />
    </>
  );
}
