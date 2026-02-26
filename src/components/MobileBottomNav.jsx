"use client";

import React from 'react';
import { Stethoscope, Building2, MessageCircle } from 'lucide-react';

export const MobileBottomNav = ({ setView, view, onInquiry, onNavClick }) => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white border-t border-gray-200 pb-safe-area shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      <div className="grid grid-cols-3 h-16 items-center relative">
        <button onClick={() => onNavClick('list_treatment')} className={`flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition ${String(view).includes('treatment') ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Stethoscope size={24} strokeWidth={String(view).includes('treatment') ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Treatments</span>
        </button>
        <div className="relative flex justify-center h-full pointer-events-none"> 
           <button onClick={onInquiry} className="pointer-events-auto absolute -top-5 flex flex-col items-center group">
              <div className="w-14 h-14 rounded-full bg-teal-600 shadow-lg shadow-teal-100 flex items-center justify-center text-white mb-1 transform group-active:scale-95 transition border-[3px] border-white">
                  <MessageCircle size={24} fill="currentColor" className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-teal-700">Inquiry</span>
           </button>
        </div>
        <button onClick={() => onNavClick('list_hospital')} className={`flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition ${String(view).includes('hospital') ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Building2 size={24} strokeWidth={String(view).includes('hospital') ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Hospitals</span>
        </button>
      </div>
    </div>
);
