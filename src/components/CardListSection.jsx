"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Star } from 'lucide-react';
import { getLangCodeFromCookie, t } from "../lib/i18n";

const useLangCode = () => {
  const [langCode, setLangCode] = useState("en");
  useEffect(() => {
    setLangCode(getLangCodeFromCookie());
  }, []);
  return langCode;
};

export const CardListSection = ({ title, items, onCardClick, type }) => {
  const langCode = useLangCode();
  return (
    <section className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 md:mb-6">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        {Array.isArray(items) && items.map((item) => (
          <div
            key={item.id}
            onClick={() => onCardClick(item.id)}
            className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500 transition-all duration-300 cursor-pointer group flex flex-row min-h-[140px] md:h-56"
          >
          <div className="w-40 md:w-auto md:h-full md:aspect-square relative bg-gray-200 overflow-hidden shrink-0">
            <img
              src={type === 'hospital' ? item.images?.[0] : item.images?.[0]} 
              onError={(e) => e.target.src = `https://placehold.co/600x600?text=${type}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              alt={item.name || item.title || "Treatment photo"}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex-1 p-3 md:p-5 flex flex-col justify-between min-w-0">
            <div>
              {type === 'hospital' ? (
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-extrabold text-sm md:text-lg text-gray-900 line-clamp-1 group-hover:text-teal-600 transition">
                    {item.name}
                  </h3>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider truncate">
                      {item.hospital}
                    </p>
                  </div>
                  <h3 className="font-extrabold text-base md:text-lg text-gray-900 mb-1 line-clamp-2 md:line-clamp-1 leading-snug group-hover:text-teal-600 transition">
                    {item.title}
                  </h3>
                </>
              )}
              {Array.isArray(item.tags) && (
                <div className="flex flex-wrap gap-1 mb-1 md:mb-3">
                  {item.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[9px] md:text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-extrabold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-[10px] md:text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {type === 'hospital' ? item.description : item.desc}
              </div>
            </div>
            <div className="pt-2 mt-auto border-t border-gray-50 flex items-end justify-between">
              {type === 'treatment' ? (
                <div>
                  <p className="hidden md:block text-[10px] text-gray-400 uppercase font-extrabold">{t("card.estPrice", langCode)}</p>
                  <p className="text-teal-700 font-black text-sm md:text-sm">{item.price}</p>
                </div>
              ) : (
                <div className="flex items-start gap-1 text-[10px] md:text-xs text-gray-500 mr-2">
                  <MapPin size={10} className="md:w-3 md:h-3 mt-0.5" />
                  <span className="line-clamp-2 whitespace-normal">
                    {item.location}
                    {item.address_detail ? `, ${item.address_detail}` : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs font-extrabold text-gray-900 shrink-0">
                <Star size={10} className="md:w-3 md:h-3 text-yellow-400 fill-yellow-400" /> {item.rating}
              </div>
            </div>
          </div>
        </div>
        ))}
      </div>
    </section>
  );
};
