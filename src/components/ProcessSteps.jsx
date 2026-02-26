"use client";

import React from 'react';
import { FileText, Search, Globe, ShieldCheck } from 'lucide-react';

export const ProcessSteps = () => (
  <div className="py-6 border-t border-gray-100">
    <h3 className="text-lg font-bold text-gray-900 mb-6">How it works</h3>
    <div className="grid grid-cols-4 gap-2 relative">
      <div className="hidden md:block absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-10 translate-y-2"></div>
      
      {[
        { step: 1, title: "Inquiry", icon: FileText },
        { step: 2, title: "Matching", icon: Search },
        { step: 3, title: "Travel", icon: Globe },
        { step: 4, title: "Care", icon: ShieldCheck }
      ].map((s, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-teal-500 text-teal-600 flex items-center justify-center font-bold text-lg shadow-sm mb-2 z-10">
            <s.icon size={20} />
          </div>
          <div className="text-xs font-bold text-gray-900">{s.title}</div>
        </div>
      ))}
    </div>
  </div>
);
