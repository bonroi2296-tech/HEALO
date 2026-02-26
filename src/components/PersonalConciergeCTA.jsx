"use client";

import React from 'react';

export const PersonalConciergeCTA = ({
  title = "Find the right treatment for you.",
  subtitle = "Get a free, personalized treatment plan — tailored to your goals and budget.",
  badge = "PERSONAL CONCIERGE",
  buttonText = "Get My Free Plan",
  onClick,
  className = "",
}) => (
    <section className={`max-w-6xl mx-auto px-4 ${className}`}>
      <div className="rounded-3xl border border-teal-100 bg-teal-50/50 p-4 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 text-center md:text-left">
        <div className="min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2 text-teal-700 text-xs font-extrabold tracking-widest">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100">✨</span>
            <span>{badge}</span>
          </div>
          <h3 className="mt-2 md:mt-3 text-xl md:text-3xl font-extrabold text-gray-900 leading-tight">
            <span className="inline-block">{title}</span>
          </h3>
          <p className="mt-1.5 md:mt-2 text-gray-700 text-xs md:text-base text-balance leading-relaxed">
            <span className="inline-block">{subtitle}</span>
          </p>
        </div>
        <div className="shrink-0 mt-2 md:mt-0">
          <button onClick={onClick} className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full bg-teal-600 text-white font-extrabold text-sm md:text-base shadow-lg hover:bg-teal-700 transition">
            {buttonText}
          </button>
        </div>
      </div>
    </section>
);
