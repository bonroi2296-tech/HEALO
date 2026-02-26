"use client";

import React from 'react';
import { Sparkles, FileText, UserCheck, Clock, ArrowRight } from 'lucide-react';

export const OfferBanner = ({ onClick }) => (
  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 mb-8">
    <h4 className="text-sm font-bold text-teal-900 mb-4 uppercase tracking-wider flex items-center gap-2">
      <Sparkles size={16} className="text-teal-600"/> Why book with HEALO?
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600"><FileText size={20}/></div>
        <div>
          <div className="font-bold text-sm text-gray-900">Free Comparison</div>
          <div className="text-xs text-gray-500 mt-0.5">Get 3 quotes from top clinics.</div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600"><UserCheck size={20}/></div>
        <div>
          <div className="font-bold text-sm text-gray-900">Full Concierge</div>
          <div className="text-xs text-gray-500 mt-0.5">Translation & pickup included.</div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600"><Clock size={20}/></div>
        <div>
          <div className="font-bold text-sm text-gray-900">Fast Response</div>
          <div className="text-xs text-gray-500 mt-0.5">Average reply within 1 hour.</div>
        </div>
      </div>
    </div>
    <button onClick={onClick} className="w-full mt-5 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-teal-700 transition flex items-center justify-center gap-2">
      Get My Free Quote Now <ArrowRight size={16}/>
    </button>
  </div>
);
