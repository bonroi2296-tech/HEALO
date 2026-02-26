"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { getLangCodeFromCookie, t } from "../lib/i18n";

const useLangCode = () => {
  const [langCode, setLangCode] = useState("en");
  useEffect(() => {
    setLangCode(getLangCodeFromCookie());
  }, []);
  return langCode;
};

export const HeroSection = ({ setView, searchTerm, setSearchTerm, siteConfig }) => {
  const langCode = useLangCode();
  return (
    <section className="relative mb-6 md:mb-12">
      <div className="relative pt-12 pb-16 md:pt-24 md:pb-20 text-center overflow-hidden bg-teal-900">
        <div className="absolute inset-0 z-0">
          {siteConfig?.hero && (
            <div className="relative w-full h-full">
              <Image 
                src={siteConfig.hero} 
                alt="HEALO medical concierge hero" 
                fill
                className="object-cover opacity-60" 
                priority
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950/80 via-teal-900/60 to-teal-800/90 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col items-center">
            <h1 className="text-[26px] sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-[1.2] drop-shadow-lg tracking-tight">
              <span className="inline-block">{t("hero.title.line1", langCode)}</span>
              <span className="text-teal-200"> {t("hero.title.highlight", langCode)}</span>
            </h1>
            <p className="text-teal-50 text-xs sm:text-sm md:text-lg max-w-2xl mx-auto font-medium opacity-90 drop-shadow-md leading-relaxed">
              {t("hero.subtitle.line1", langCode)}
              <br className="hidden sm:block"/>
              {t("hero.subtitle.line2", langCode)}
            </p>
        </div>
      </div>
      <div className="relative z-20 max-w-2xl mx-auto px-4 -mt-8 md:-mt-10">
        <div className="bg-white p-2 md:p-2.5 rounded-full shadow-2xl flex items-center border border-gray-100">
            <Search className="text-teal-600 ml-3 md:ml-4 shrink-0" size={20} />
            <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("search.placeholder", langCode)}
            className="flex-1 p-3 md:p-4 text-gray-800 placeholder-gray-400 outline-none bg-transparent text-sm md:text-lg min-w-0 font-medium"
            onKeyDown={(e) => e.key === 'Enter' && setView('list_treatment')}
            />
            <button
            onClick={() => setView('list_treatment')}
            className="bg-teal-600 text-white px-5 md:px-8 py-2.5 md:py-3.5 rounded-full font-bold text-sm md:text-base hover:bg-teal-700 transition shadow-lg shrink-0"
            >
            {t("search.button", langCode)}
            </button>
        </div>
      </div>
    </section>
  );
};
