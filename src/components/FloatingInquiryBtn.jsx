"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingInquiryBtn = ({ onClick }) => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group cursor-pointer" onClick={onClick}>
      <div className="bg-white text-gray-800 text-xs font-extrabold px-3 py-2 rounded-xl shadow-md border border-gray-100 mb-1 animate-bounce">
        Need Help? 💬
      </div>
      <button className="w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95 relative">
        <MessageCircle size={28} fill="currentColor" className="text-teal-100" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
      </button>
    </div>
);
