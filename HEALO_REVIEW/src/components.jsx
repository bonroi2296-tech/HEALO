"use client";

// src/components.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Search, MapPin, Globe, Menu, Star, Zap, ChevronDown, CheckCircle,
  MessageCircle, X, ArrowRight, Stethoscope, Building2, Settings,
  FileText, UserCheck, Clock, ShieldCheck, Sparkles
} from 'lucide-react';
import { getLangCodeFromCookie, getLangCodeFromLabel, t } from "./lib/i18n";

/**
 * 유틸: 바깥 클릭 시 닫기
 */
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

const useLangCode = () => {
  const [langCode, setLangCode] = useState("en");
  useEffect(() => {
    setLangCode(getLangCodeFromCookie());
  }, []);
  return langCode;
};

// --- 1. 헤더 ---
export const Header = ({ setView, view, handleGlobalInquiry, isMobileMenuOpen, setIsMobileMenuOpen, onNavClick, session, onLogout, siteConfig }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ENG');
  const isAdmin = session?.user?.email === 'admin@healo.com';
  const langCode = getLangCodeFromLabel(currentLang);
  
  useEffect(() => {
    setCurrentLang(getLangFromCookie());
  }, []);

  const handleLanguageChange = (langLabel) => {
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
      window.location.reload();
  };

  // 활성 탭 스타일링
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
                <img src={siteConfig.logo} alt="HEALO" className="h-8 md:h-10 object-contain" />
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
              <div className="flex items-center gap-4">
                {session ? (
                  <>
                    <span className="text-xs font-bold text-teal-100">{t("auth.greeting", langCode)}, {session.user.email.split('@')[0]}</span>
                    <button onClick={onLogout} className="text-sm font-bold text-white/80 hover:text-red-200 transition">{t("auth.logout", langCode)}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setView('login')} className="text-sm font-bold text-white/80 hover:text-white transition">{t("auth.login", langCode)}</button>
                    <button onClick={() => setView('signup')} className="text-sm font-bold text-white/80 hover:text-white transition">{t("auth.signup", langCode)}</button>
                  </>
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
                     <div className="text-sm text-gray-500 py-1">{t("auth.greeting", langCode)}, {session.user.email.split('@')[0]}</div>
                     <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-left py-2 text-red-500 hover:text-red-700">{t("auth.logout", langCode)}</button>
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

// --- 2. 히어로 섹션 ---
export const HeroSection = ({ setView, searchTerm, setSearchTerm, siteConfig }) => {
  const langCode = useLangCode();
  return (
    <section className="relative mb-12">
      <div className="relative pt-12 pb-16 md:pt-24 md:pb-20 text-center overflow-hidden bg-teal-900">
        <div className="absolute inset-0 z-0">
          <img 
            src={siteConfig?.hero || "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=2000"} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950/80 via-teal-900/60 to-teal-800/90 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg tracking-tight">
              {t("hero.title.line1", langCode)}<br className="hidden md:block"/> 
              <span className="text-teal-200">{t("hero.title.highlight", langCode)}</span>
            </h1>
            <p className="text-teal-50 text-sm md:text-lg max-w-2xl mx-auto font-medium opacity-90 drop-shadow-md">
              {t("hero.subtitle.line1", langCode)}<br className="hidden md:block"/>
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

// --- 3. 카드 리스트 섹션 ---
export const CardListSection = ({ title, items, onCardClick, type }) => {
  const langCode = useLangCode();
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-6">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onCardClick(item.id)}
            className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500 transition-all duration-300 cursor-pointer group flex flex-row h-36 md:h-56"
          >
          <div className="w-40 md:w-auto md:h-full md:aspect-square relative bg-gray-200 overflow-hidden shrink-0">
            <img
              src={type === 'hospital' ? item.images?.[0] : item.images?.[0]} 
              onError={(e) => e.target.src = `https://placehold.co/600x600?text=${type}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              alt="img"
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
              {item.tags && (
                <div className="flex flex-wrap gap-1 mb-1 md:mb-3">
                  {item.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[9px] md:text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-extrabold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="hidden md:block text-xs text-gray-500 line-clamp-2 leading-relaxed">
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

// --- 4. 플로팅 버튼 및 기타 ---
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

export const PersonalConciergeCTA = ({
  title = "Find the right treatment for you.",
  subtitle = "Get a free, personalized treatment plan — tailored to your goals and budget.",
  badge = "PERSONAL CONCIERGE",
  buttonText = "Get My Free Plan",
  onClick,
  className = "",
}) => (
    <section className={`max-w-6xl mx-auto px-4 ${className}`}>
      <div className="rounded-3xl border border-teal-100 bg-teal-50/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
        <div className="min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2 text-teal-700 text-xs font-extrabold tracking-widest">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100">✨</span>
            <span>{badge}</span>
          </div>
          <h3 className="mt-3 text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h3>
          <p className="mt-2 text-gray-700 text-sm md:text-base text-balance leading-relaxed">{subtitle}</p>
        </div>
        <div className="shrink-0 mt-2 md:mt-0">
          <button onClick={onClick} className="w-full md:w-auto px-8 py-4 rounded-full bg-teal-600 text-white font-extrabold shadow-lg hover:bg-teal-700 transition">
            {buttonText}
          </button>
        </div>
      </div>
    </section>
);

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

// 🔥 [NEW] 5. 오퍼 배너 (Offer Banner) - 가짜 리뷰 대신 사용할 신뢰 장치
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

// 🔥 [NEW] 6. 프로세스 스텝 (Process Steps) - 막연한 불안감 해소
export const ProcessSteps = () => (
  <div className="py-6 border-t border-gray-100">
    <h3 className="text-lg font-bold text-gray-900 mb-6">How it works</h3>
    <div className="grid grid-cols-4 gap-2 relative">
      {/* 연결선 (PC에서만) */}
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

export { SEO } from './components/SEO';