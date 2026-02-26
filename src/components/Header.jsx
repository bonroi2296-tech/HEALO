"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Globe, Menu, Zap, ChevronDown, CheckCircle,
  X, ArrowRight, Settings, LogOut
} from 'lucide-react';
import { getLangCodeFromLabel, t } from "../lib/i18n";

const useOutsideClose = (isOpen, onClose) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose();
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);
  return ref;
};

const getLangFromCookie = () => {
  if (typeof document === 'undefined') return 'ENG';
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find((row) => row.trim().startsWith('googtrans='));
  if (langCookie) {
    const langCode = langCookie.split('=')[1].split('/').pop();
    if (langCode === 'ko') return 'KOR';
    if (langCode === 'zh-CN') return 'CHN';
    if (langCode === 'ja') return 'JPN';
  }
  return 'ENG';
};

const UserMenu = ({ session, onLogout, langCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useOutsideClose(isOpen, () => setIsOpen(false));

  const getInitials = (email) => {
    if (!email) return 'U';
    const name = email.split('@')[0];
    if (name.length === 1) return name.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(session?.user?.email);

  return (
    <div className="relative flex-shrink-0 w-[64px]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-600 rounded-full group"
        title={session?.user?.email}
        aria-label="Account menu"
      >
        <div className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white font-semibold text-sm group-hover:bg-white/15 group-hover:border-white/25 transition-all shadow-sm">
          {initials}
        </div>
        <ChevronDown
          size={14}
          className={`text-white/60 group-hover:text-white/80 transition-all ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3.5 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1.5">
                {t("auth.signedInAs", langCode)}
              </div>
              <div className="text-sm font-medium text-gray-900 break-words leading-relaxed">
                {session?.user?.email}
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition-colors flex items-center gap-2.5 text-red-600 font-medium group"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" />
              <span>{t("auth.logout", langCode)}</span>
            </button>
          </div>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};

export const Header = ({ setView, view, handleGlobalInquiry, isMobileMenuOpen, setIsMobileMenuOpen, onNavClick, session, onLogout, siteConfig }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ENG');
  const isAdmin = session?.user?.email === 'admin@healo.com';
  const langCode = getLangCodeFromLabel(currentLang);
  
  useEffect(() => {
    setCurrentLang(getLangFromCookie());
  }, []);

  const handleLanguageChange = (langLabel) => {
      if (currentLang === langLabel) {
        setIsLangOpen(false);
        return;
      }
      
      let googleLangCode = 'en';
      switch (langLabel) {
          case 'KOR': googleLangCode = 'ko'; break;
          case 'CHN': googleLangCode = 'zh-CN'; break;
          case 'JPN': googleLangCode = 'ja'; break;
          default: googleLangCode = 'en';
      }
      document.cookie = `googtrans=/en/${googleLangCode}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${googleLangCode}; path=/;`;
      setCurrentLang(langLabel);
      setIsLangOpen(false);
  };

  const getNavLinkClass = (targetView) => {
      const isActive = String(view).includes(targetView);
      return `text-sm font-bold transition px-3 py-1.5 rounded-full ${isActive ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/20' : 'text-white/80 hover:text-white'}`;
  };

  return (
    <>
      <header className="bg-teal-600 text-white sticky top-0 z-50 shadow-sm border-b border-teal-500">
        <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 relative flex items-center justify-between">
          
          <div className="flex items-center cursor-pointer gap-3 z-20" onClick={() => onNavClick('home')}>
            {siteConfig?.logo ? (
                <Image src={siteConfig.logo} alt="HEALO" width={120} height={40} className="h-8 md:h-10 object-contain" />
            ) : (
                <span className="text-xl md:text-2xl font-extrabold tracking-tight notranslate">HEALO</span>
            )}
            <span className="hidden lg:block text-xs text-teal-100 font-light uppercase tracking-widest border-l border-teal-400/60 pl-3">
              AI Medical Concierge
            </span>
          </div>

          {!isAdmin && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-30 pointer-events-auto">
              <button onClick={handleGlobalInquiry} className="flex items-center gap-2 text-sm font-extrabold bg-white text-teal-700 px-6 py-2 rounded-full hover:bg-teal-50 transition shadow-md ring-2 ring-teal-600/20">
                <Zap size={16} className="text-teal-600 fill-teal-600" /> {t("cta.freePlan", langCode)}
              </button>
            </div>
          )}

          <div className="ml-auto hidden md:flex items-center z-20">
            <div className="flex items-center gap-4 pl-6">
              <nav className="flex items-center gap-2">
                <button onClick={() => onNavClick('list_treatment')} className={getNavLinkClass('treatment')}>{t("nav.treatments", langCode)}</button>
                <button onClick={() => onNavClick('list_hospital')} className={getNavLinkClass('hospital')}>{t("nav.hospitals", langCode)}</button>
              </nav>
              <div className="w-px h-5 bg-white/20" />
              <div className="flex items-center gap-4 w-[120px] justify-end flex-shrink-0">
                {session ? (
                  <UserMenu session={session} onLogout={onLogout} langCode={langCode} />
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('login')} className="text-sm font-bold text-white/80 hover:text-white transition whitespace-nowrap">{t("auth.login", langCode)}</button>
                    <button onClick={() => setView('signup')} className="text-sm font-bold text-white/80 hover:text-white transition whitespace-nowrap">{t("auth.signup", langCode)}</button>
                  </div>
                )}
              </div>
              <div className="w-px h-5 bg-white/20" />
              
              <div className="relative">
                <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-1 text-white/80 hover:text-white text-sm font-bold transition notranslate">
                  <Globe size={16} className="opacity-90" />
                  <span>{currentLang}</span>
                  <ChevronDown size={14} className={`opacity-80 transition ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1 text-gray-800 notranslate">
                      <button onClick={() => handleLanguageChange('ENG')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between">ENG {currentLang==='ENG' && <CheckCircle size={12}/>}</button>
                      <button onClick={() => handleLanguageChange('KOR')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between">KOR {currentLang==='KOR' && <CheckCircle size={12}/>}</button>
                      <button onClick={() => handleLanguageChange('CHN')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between">CHN {currentLang==='CHN' && <CheckCircle size={12}/>}</button>
                      <button onClick={() => handleLanguageChange('JPN')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between">JPN {currentLang==='JPN' && <CheckCircle size={12}/>}</button>
                    </div>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsLangOpen(false)} />
                  </>
                )}
              </div>
              {isAdmin && (
                <>
                  <div className="w-px h-5 bg-white/20" />
                  <button onClick={() => setView('admin')} className="text-white/80 hover:text-white transition p-1 rounded-full hover:bg-white/10" title="Admin Settings"><Settings size={20} /></button>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-3 z-20">
            {session && (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {session?.user?.email?.split('@')?.[0]?.substring(0, 2)?.toUpperCase()}
              </div>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
           <div className="relative w-[80%] max-w-[300px] h-full bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                 <span className="text-xl font-extrabold text-teal-600 notranslate">HEALO</span>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20}/></button>
              </div>
              <nav className="flex flex-col gap-4 text-lg font-bold text-gray-800">
                 <div className="flex gap-2 mb-4 notranslate">
                    <button onClick={() => handleLanguageChange('ENG')} className={`px-3 py-1 rounded-lg border text-xs ${currentLang==='ENG'?'bg-teal-600 text-white':'text-gray-500'}`}>ENG</button>
                    <button onClick={() => handleLanguageChange('KOR')} className={`px-3 py-1 rounded-lg border text-xs ${currentLang==='KOR'?'bg-teal-600 text-white':'text-gray-500'}`}>KOR</button>
                    <button onClick={() => handleLanguageChange('CHN')} className={`px-3 py-1 rounded-lg border text-xs ${currentLang==='CHN'?'bg-teal-600 text-white':'text-gray-500'}`}>CHN</button>
                    <button onClick={() => handleLanguageChange('JPN')} className={`px-3 py-1 rounded-lg border text-xs ${currentLang==='JPN'?'bg-teal-600 text-white':'text-gray-500'}`}>JPN</button>
                 </div>
               {isAdmin && <button onClick={() => { setView('admin'); setIsMobileMenuOpen(false); }} className="text-left py-3 px-4 bg-gray-900 text-white rounded-lg flex items-center gap-2 mb-2"><Settings size={18}/> Admin Settings</button>}
                 <button onClick={() => onNavClick('list_treatment')} className="text-left py-2 flex items-center justify-between">Treatments <ArrowRight size={16} className="text-gray-300"/></button>
                 <button onClick={() => onNavClick('list_hospital')} className="text-left py-2 flex items-center justify-between">Hospitals <ArrowRight size={16} className="text-gray-300"/></button>
                 <hr className="border-gray-100 my-2"/>
               {session ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <div className="text-xs text-gray-500 mb-1">{t("auth.signedInAs", langCode)}</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{session.user.email}</div>
                    </div>
                    <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2">
                      <LogOut size={18} />
                      {t("auth.logout", langCode)}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="text-left py-2 text-gray-500 hover:text-teal-600">{t("auth.login", langCode)}</button>
                    <button onClick={() => { setView('signup'); setIsMobileMenuOpen(false); }} className="text-left py-2 text-gray-500 hover:text-teal-600">{t("auth.signup", langCode)}</button>
                  </>
                )}
              </nav>
           </div>
        </div>
      )}
    </>
  );
};
