import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Star, Clock, Activity, Syringe, Sparkles, Check, 
  ChevronLeft, MessageCircle, Shield, CheckCircle2,
  Bot, ClipboardList, Headset, ArrowRight, Save, PlusCircle,
  Image as ImageIcon, Map, Mail, Lock, User, X, ThumbsUp,
  Award, GraduationCap, Users, Globe, Stethoscope, Calendar,
  Building2, Info, FileText, ShieldCheck, HelpCircle, HeartHandshake,
  Eye, EyeOff, UploadCloud, Calendar as CalendarIcon, CheckSquare,
  File, AlertCircle
} from 'lucide-react';
import { TREATMENTS, INITIAL_HOSPITALS, REVIEWS_DATA, PRIVACY_CONTENT, TERMS_CONTENT } from './data';
import { supabase } from './supabase'; // 이거 한 줄 추가!

// --- [공통] 약관 팝업 ---
const PolicyModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-left"> {/* text-left 추가 */}
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} className="text-gray-500"/></button>
                </div>
                
                {/* 본문 영역에 text-left 추가하여 왼쪽 정렬 강제 적용 */}
                <div className="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-gray-600 leading-relaxed h-full text-left">
                    {content}
                </div>
                
                <div className="p-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
                    <button onClick={onClose} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition">I Understand</button>
                </div>
            </div>
        </div>
    );
};

// --- 리뷰 전체보기 팝업 ---
const ReviewModal = ({ isOpen, onClose, reviews }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
                    <h3 className="text-xl font-bold text-gray-900">All Reviews ({reviews.length})</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={24} className="text-gray-400"/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                                        {review.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900">{review.name}</p>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{review.country}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">{review.date}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400 gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor"/>)}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">{review.content}</p>
                            <div className="flex gap-2 mb-3">
                                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-500 font-bold cursor-pointer hover:bg-gray-300 transition">Review 1</div>
                                {review.id === 1 && <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-500 font-bold cursor-pointer hover:bg-gray-300 transition">Review 2</div>}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <ThumbsUp size={12}/> Helpful ({review.helpful})
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 1. 시술 상세 페이지 ---
export const TreatmentDetailPage = ({ selectedId, setView, setInquiryMode, onTreatmentClick, onHospitalClick }) => {
  const data = TREATMENTS.find(t => t.id === selectedId) || TREATMENTS[0];
  const hospital = INITIAL_HOSPITALS.find(h => h.id === data.hospitalId);
  const isPartner = hospital?.tags?.some(t => String(t).toLowerCase().includes("partner"));

  // 데이터 로딩 안전장치
  if (!data) return <div className="p-20 text-center">Loading...</div>;

  const relatedTreatments = TREATMENTS.filter(t => t.hospitalId === data.hospitalId && t.id !== data.id);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  useEffect(() => { window.scrollTo(0, 0); }, [data.id]);

  // -------------------------------------------------------------------
  // [이미지 데이터] 5장을 채우기 위한 로직 (없으면 샘플로 채움)
  // -------------------------------------------------------------------
  const galleryImages = [
    data.images?.[0] || "https://placehold.co/800x800?text=Main+Procedure", 
    data.images?.[1] || "https://placehold.co/800x800?text=Detail+1", 
    data.images?.[2] || "https://placehold.co/800x800?text=Detail+2", 
    data.images?.[3] || "https://placehold.co/800x800?text=Detail+3", 
    data.images?.[4] || "https://placehold.co/800x800?text=Detail+4" 
  ];

  // [모바일용] 롤링 배너 상태 관리
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const nextSlide = (e) => { e?.stopPropagation(); setCurrentSlide((prev) => (prev + 1) % galleryImages.length); };
  const prevSlide = (e) => { e?.stopPropagation(); setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length); };
  const trustSignals = [
    { title: "Licensed Medical Institution", desc: "Registered under Korean medical regulations.", icon: <Shield size={18} className="text-teal-700" /> },
    { title: "Consent-based Sharing", desc: "Your inquiry is shared only with your consent.", icon: <Info size={18} className="text-teal-700" /> },
    { title: "Transparent Quote", desc: "Itemized estimate. No hidden fees.", icon: <FileText size={18} className="text-teal-700" /> },
    { title: "Global Support", desc: "Interpretation support available.", icon: <Globe size={18} className="text-teal-700" /> },
  ];

  const faq = [
    { q: "Is the price final?", a: "Prices are estimates. Final quote is confirmed by the clinic." },
    { q: "Interpretation support?", a: "Available upon request. We can coordinate schedules." },
    { q: "How HEALO works?", a: "We connect you to the clinic. Payments happen directly at the hospital." },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-in fade-in slide-in-from-bottom-4">
      
      {/* ================================================================== */}
      {/* 1. 이미지 섹션 (Mobile: 1:1 롤링 / Desktop: 1:1 그리드) */}
      {/* ================================================================== */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* [A] 모바일 전용: 1:1 비율 롤링 배너 (aspect-square 적용) */}
        <div className="md:hidden w-full aspect-square relative group overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
            {galleryImages.map((img, index) => (
            <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <img src={img} className="w-full h-full object-cover" alt={`Slide ${index + 1}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
            ))}
            
            {/* 모바일 네비게이션 */}
            <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20"><ChevronLeft size={20}/></button>
            <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20"><ArrowRight size={20}/></button>
            
            {/* 모바일 인디케이터 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {galleryImages.map((_, idx) => (
                    <div key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${idx === currentSlide ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`}></div>
                ))}
            </div>
            
            {/* 우측 하단 사진 더보기 버튼 */}
            <div className="absolute bottom-3 right-3 z-20">
                <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <ImageIcon size={10}/> {currentSlide + 1}/{galleryImages.length}
                </div>
            </div>
        </div>

        {/* [B] 데스크탑 전용: 1:1 비율 5분할 그리드 */}
        <div className="hidden md:flex flex-row gap-2 h-[500px]">
             {/* 왼쪽 큰 이미지 (1:1 비율 유지하면서 꽉 채움) */}
             <div className="w-1/2 h-full relative group cursor-pointer overflow-hidden rounded-xl">
                <img src={galleryImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10"><ImageIcon size={12}/> View All Photos</div>
             </div>

             {/* 오른쪽 작은 이미지 4개 (정사각형 그리드) */}
             <div className="w-1/2 h-full grid grid-cols-2 grid-rows-2 gap-2">
                {galleryImages.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative overflow-hidden cursor-pointer group rounded-xl">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={`Detail ${idx}`} />
                        {idx === 3 && (
                          <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition flex items-center justify-center text-white font-bold text-lg">
                            +More
                          </div>
                        )}
                    </div>
                ))}
             </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => setView('list_treatment')} className="flex items-center text-sm font-bold text-gray-500 mb-6 hover:text-teal-600"><ChevronLeft size={16}/> Back to Treatments</button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-8">
             <div>
                <div className="flex gap-2 mb-3">
                    {data.tags && data.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">{tag}</span>)}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{data.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    Provided by 
                    <span onClick={() => onHospitalClick(data.hospitalId)} className="font-bold text-teal-600 underline cursor-pointer hover:text-teal-800 ml-1">
                        {data.hospital}
                    </span> 
                    <Shield size={14} className="text-teal-500 fill-teal-500 ml-1"/>
                </div>
             </div>

             <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Treatment Overview</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{data.fullDescription || data.desc}</p>
                {data.benefits && (
                    <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles size={18} className="text-teal-500 fill-teal-500"/> Key Benefits</h4>
                        <ul className="space-y-3">
                            {data.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-teal-100 rounded-full p-1 shrink-0"><Check size={12} className="text-teal-600 stroke-[3]"/></div>
                                    <span className="text-gray-700 font-medium text-sm leading-snug">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
             </section>

             <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Verified Reviews <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{data.rating}/5.0</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">From real patients who visited through HEALO</p>
                    </div>
                    <span onClick={() => setIsReviewModalOpen(true)} className="text-teal-600 text-sm font-bold cursor-pointer hover:underline">
                        See all {REVIEWS_DATA.length} reviews
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {REVIEWS_DATA.slice(0, 3).map(review => (
                        <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
                                        {review.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm font-bold text-gray-900">{review.name}</p>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">{review.country}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">{review.date}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex text-yellow-400 mb-3 gap-0.5">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor"/>)}
                            </div>
                            <p className="text-sm text-gray-600 leading-snug mb-4 flex-1 line-clamp-4">"{review.content}"</p>
                            <div className="flex gap-2 mt-auto">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-500 font-medium cursor-pointer hover:bg-gray-300 transition">Review 1</div>
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-[10px] text-gray-500 font-medium cursor-pointer hover:bg-gray-300 transition">Result</div>
                            </div>
                        </div>
                    ))}
                </div>
             </section>

            <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hospital Overview</h3>
                {/* rounded-3xl 유지, flex 레이아웃 */}
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                    {/* Left: Info (padding을 p-6으로 줄여서 컴팩트하게) */}
                    <div className="p-6 md:w-1/2 flex flex-col justify-between bg-white">
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-1">{data.hospital}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                <MapPin size={14}/> Gangnam, Seoul
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                                {data.hospital} is a premier medical center renowned for its state-of-the-art facilities and patient-centered care.
                            </p>
                            <button onClick={() => onHospitalClick(data.hospitalId)} className="text-teal-600 font-bold text-xs hover:underline flex items-center gap-1">
                                View Hospital Details <ArrowRight size={12}/>
                            </button>
                        </div>
                        
                        {/* [수정] 운영 시간표: w-14로 요일 너비 고정 -> 줄맞춤 깔끔하게 */}
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 w-14">Mon-Fri:</span> 
                                <span className="text-gray-600">09:00 - 18:00</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-600 w-14">Sat:</span> 
                                <span className="text-gray-600">09:00 - 14:00</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-red-500 w-14">Sun:</span> 
                                <span className="text-teal-600 font-bold">Inquiries Welcome</span>
                            </div>
                        </div>
                    </div>
                    {/* Right: Map Placeholder */}
                    <div className="bg-gray-100 md:w-1/2 min-h-[200px] md:min-h-auto flex items-center justify-center text-gray-400 font-bold relative group cursor-pointer hover:bg-gray-200 transition">
                        <div className="flex flex-col items-center gap-2">
                            <Map size={28}/>
                            <span className="text-xs">Google Map</span>
                        </div>
                    </div>
                </div>
             </section>

             {/* More from {data.hospital} */}
             <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">More from {data.hospital}</h3>
                {relatedTreatments.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedTreatments.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => { if(onTreatmentClick) onTreatmentClick(item.id); }}
                                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group flex flex-col"
                            >
                                <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative">
                                    <img src={item.logo} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="img"/>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600">{item.title}</h4>
                                    <div className="mt-auto pt-2">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Est. Price</p>
                                        <p className="text-teal-600 font-extrabold text-sm">{item.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 text-sm py-4">No other treatments available from this hospital yet.</div>
                )}
             </section>
          </div>



          {/* RIGHT SIDEBAR */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              
              {/* Card 1: Estimated Price & Inquiry */}
              <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-xl text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estimated Price</p>
                <div className="text-3xl font-extrabold text-teal-600 mb-6">{data.price}</div>
                
                <div className="space-y-3">
                    <button 
                        onClick={() => { setInquiryMode('select'); setView('inquiry'); }} 
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={20}/> Contact Via HEALO
                    </button>
                    <button 
                        onClick={() => onHospitalClick(data.hospitalId)} 
                        className="w-full bg-white border-2 border-teal-100 text-teal-700 font-bold py-3 rounded-xl hover:bg-teal-50 transition"
                    >
                        View Hospital Profile
                    </button>
                </div>

                {/* "Why contact" 리스트 */}
                <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-2 mb-3">
                        <ShieldCheck size={16} className="text-teal-600" /> Why contact via HEALO?
                    </p>
                    <ul className="space-y-2 text-[11px] text-gray-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                            Compare options with an itemized estimate
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                            Coordinator support for international patients
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                            Consent-based sharing & privacy guidance
                        </li>
                    </ul>
                </div>
              </div>

              {/* Card 2: Trust & Verification */}
              <div className={`rounded-2xl p-5 border ${isPartner ? "bg-teal-50 border-teal-100" : "bg-amber-50 border-amber-100"}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`shrink-0 mt-0.5 ${isPartner ? "text-teal-700" : "text-amber-700"}`}><Shield size={20} /></div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Trust & Verification</h4>
                    <p className="text-xs text-gray-600 leading-snug mt-1">{isPartner ? "Verified for safety & standards." : "Publicly available info."}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {trustSignals.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">{item.icon}</div>
                      <div><p className="text-xs font-bold text-gray-900">{item.title}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        reviews={REVIEWS_DATA} 
      />
    </div>
  );
};

// --- 2. 병원 상세 페이지 (✅ 안전장치 추가됨) ---
export const HospitalDetailPage = ({ selectedId, setView, onTreatmentClick }) => {
  const hospital = INITIAL_HOSPITALS.find((h) => h.id === selectedId) || INITIAL_HOSPITALS[0];

  // [이미지 데이터] 5장
  const galleryImages = [
    hospital.images?.[0] || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800&h=800",
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800&h=800",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800&h=800",
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&q=80&w=800&h=800",
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800&h=800"
  ];

  // [모바일용] 롤링 배너
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const nextSlide = (e) => { e?.stopPropagation(); setCurrentSlide((prev) => (prev + 1) % galleryImages.length); };
  const prevSlide = (e) => { e?.stopPropagation(); setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length); };

  // 데이터 로딩 안전장치
  if (!hospital) return <div className="p-20 text-center">Loading Hospital...</div>;

  const hospitalTreatments = TREATMENTS.filter((t) => t.hospitalId === hospital.id);

  // 의사 정보
  const doctor = hospital.doctorProfile || {
    name: "Medical Team",
    title: "Specialist",
    image: "https://placehold.co/200x200/cccccc/ffffff?text=Doctor",
    years: "10+",
    school: "Certified Medical School",
    specialties: ["General Care", "Consultation"],
    heroMetric: { value: "100%", label: "Satisfaction" },
  };

  const isPartner = Array.isArray(hospital.tags) && hospital.tags.some((t) => String(t).toLowerCase().includes("partner"));
  
  const trustSignals = [
    { title: "Licensed Medical Institution", desc: "Registered under Korean medical regulations.", icon: <Shield size={18} className="text-teal-700" /> },
    { title: "Consent-based Sharing", desc: "Your inquiry is shared only with your consent.", icon: <Info size={18} className="text-teal-700" /> },
    { title: "Transparent Quote", desc: "Itemized estimate. No hidden fees.", icon: <FileText size={18} className="text-teal-700" /> },
    { title: "Global Support", desc: "Interpretation support available.", icon: <Globe size={18} className="text-teal-700" /> },
  ];

  const faq = [
    { q: "Is the price final?", a: "Prices are estimates. Final quote is confirmed by the clinic." },
    { q: "Interpretation support?", a: "Available upon request. We can coordinate schedules." },
    { q: "How HEALO works?", a: "We connect you to the clinic. Payments happen directly at the hospital." },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. 이미지 섹션 (Mobile: 1:1 롤링 / Desktop: 1:1 그리드) */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* [A] 모바일 전용: 1:1 비율 롤링 배너 */}
        <div className="md:hidden w-full aspect-square relative group overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
            {galleryImages.map((img, index) => (
            <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <img src={img} className="w-full h-full object-cover" alt={`Slide ${index + 1}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
            ))}
            <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20"><ChevronLeft size={20}/></button>
            <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-sm transition z-20"><ArrowRight size={20}/></button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {galleryImages.map((_, idx) => (
                    <div key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${idx === currentSlide ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`}></div>
                ))}
            </div>
            <div className="absolute bottom-3 right-3 z-20">
                <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <ImageIcon size={10}/> {currentSlide + 1}/{galleryImages.length}
                </div>
            </div>
        </div>

        {/* [B] 데스크탑 전용: 1:1 비율 5분할 그리드 */}
        <div className="hidden md:flex flex-row gap-2 h-[500px]">
             <div className="w-1/2 h-full relative group cursor-pointer overflow-hidden rounded-xl">
                <img src={galleryImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10"><ImageIcon size={12}/> View All Photos</div>
             </div>
             <div className="w-1/2 h-full grid grid-cols-2 grid-rows-2 gap-2">
                {galleryImages.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative overflow-hidden cursor-pointer group rounded-xl">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={`Detail ${idx}`} />
                        {idx === 3 && (
                          <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition flex items-center justify-center text-white font-bold text-lg">
                            +More
                          </div>
                        )}
                    </div>
                ))}
             </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => setView("list_hospital")} className="flex items-center text-sm font-bold text-gray-500 mb-6 hover:text-teal-600">
          <ChevronLeft size={16} /> Back to Hospitals
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 2. 병원 타이틀 및 정보 (상세 내용 상단에 배치) */}
            <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {hospital.tags?.map((tag, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">{tag}</span>
                    ))}
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1 ${isPartner ? "bg-teal-600 text-white border-teal-600" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {isPartner ? <ShieldCheck size={12}/> : <Info size={12}/>}
                        {isPartner ? "Verified Partner" : "Public Info"}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{hospital.name}</h1>
                <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-1.5 hover:text-teal-600 transition cursor-pointer">
                        <MapPin size={18} className="text-teal-500" /> {hospital.location}
                    </span>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <span className="flex items-center gap-1.5">
                        <Star size={18} className="text-yellow-400 fill-yellow-400" /> 
                        <span className="font-bold text-gray-900">{hospital.rating}</span> 
                        <span className="opacity-70 underline cursor-pointer hover:text-teal-600">({hospital.reviews} verified reviews)</span>
                    </span>
                </div>
            </div>

            {/* 3. Medical Director */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Stethoscope size={24} className="text-teal-600" /> Medical Director
                </h2>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                  Board Certified
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:shadow-md transition">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full mix-blend-multiply filter blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                <div className="w-full md:w-40 md:h-40 shrink-0">
                  <div className="w-32 h-32 mx-auto md:w-40 md:h-40 rounded-full p-1 border-2 border-teal-100 relative">
                    <img src={doctor.image} className="w-full h-full object-cover rounded-full" alt="Doctor" />
                    <div
                      className="absolute bottom-1 right-1 bg-teal-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm"
                      title="Verified"
                    >
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-extrabold text-gray-900">{doctor.name}</h3>
                  <p className="text-teal-600 font-bold text-sm mb-4">{doctor.title}</p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      <GraduationCap size={14} className="text-gray-400" /> {doctor.school}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      <Award size={14} className="text-gray-400" /> {doctor.years} Experience
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      <ShieldCheck size={14} className="text-gray-400" /> Verified Profile
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-5">
                    {Array.isArray(doctor.specialties) &&
                      doctor.specialties.map((spec, i) => (
                        <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-md">
                          #{spec}
                        </span>
                      ))}
                  </div>

                  <div className="bg-teal-600/5 rounded-xl p-3 border border-teal-100 inline-block w-full md:w-auto">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <div className="text-2xl font-black text-teal-600">{doctor.heroMetric?.value}</div>
                      <div className="text-left leading-none">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Proven Record</p>
                        <p className="text-xs font-bold text-gray-700">{doctor.heroMetric?.label}</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-500 leading-snug">
                    Credentials and specialties are shown for reference. Final consultation details are confirmed directly
                    by the clinic.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. About */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={24} className="text-teal-600" /> About Hospital
              </h2>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <p className="text-gray-600 leading-relaxed text-lg">{hospital.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <Shield size={18} className="text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">Safety & Compliance Focused</p>
                      <p className="text-xs text-gray-600 leading-snug mt-1">
                        We prioritize clinics that follow clear patient communication and compliance expectations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <FileText size={18} className="text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">Itemized Quote Guidance</p>
                      <p className="text-xs text-gray-600 leading-snug mt-1">
                        Request an itemized estimate. We help clarify scope so you can compare fairly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 leading-snug">
                  HEALO provides concierge & lead coordination. Medical decisions and final quotes are provided by the
                  clinic.
                </div>
              </div>
            </section>

            {/* 5. International Patient Journey */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <ShieldCheck size={24} className="text-teal-600" /> International Patient Care
              </h2>
              <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                          <h3 className="text-xl font-bold mb-2">Verified Safety Standards</h3>
                          <p className="text-teal-100 text-sm leading-relaxed mb-6">
                              This facility meets HEALO's strict criteria for international patient safety, 
                              sterilization, and transparent pricing.
                          </p>
                          <ul className="space-y-3">
                              {['1:1 Coordinator Support', 'Transparent Pricing Policy', 'Post-Care Follow-up'].map((item, i) => (
                                  <li key={i} className="flex items-center gap-3 text-sm font-bold">
                                      <div className="bg-teal-500/30 p-1 rounded-full"><Check size={12}/></div> {item}
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                          <div className="flex justify-between items-center text-center">
                              <div><div className="text-2xl font-bold mb-1">Step 1</div><div className="text-[10px] uppercase opacity-70">Consult</div></div>
                              <ArrowRight size={16} className="text-teal-300"/>
                              <div><div className="text-2xl font-bold mb-1">Step 2</div><div className="text-[10px] uppercase opacity-70">Travel</div></div>
                              <ArrowRight size={16} className="text-teal-300"/>
                              <div><div className="text-2xl font-bold mb-1">Step 3</div><div className="text-[10px] uppercase opacity-70">Care</div></div>
                          </div>
                          <div className="mt-4 text-center">
                              <button onClick={() => setView('inquiry')} className="bg-white text-teal-800 text-xs font-bold px-4 py-2 rounded-full hover:bg-teal-50 transition">
                                  Start Your Journey
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
            </section>
            
            {/* 6. Signature Programs */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles size={24} className="text-teal-600" /> Signature Programs
              </h2>

              {hospitalTreatments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospitalTreatments.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onTreatmentClick(item.id)}
                      className="flex bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-teal-200 transition cursor-pointer group"
                    >
                      <div className="w-28 h-28 bg-gray-200 shrink-0 relative">
                        <img
                          src={item.logo}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          alt="img"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                      </div>
                      <div className="p-4 flex flex-col justify-center flex-1">
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-teal-600 line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.desc}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <p className="text-teal-600 font-extrabold text-sm">{item.price}</p>
                          <ArrowRight size={14} className="text-gray-300 group-hover:text-teal-500 transition" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-500">No treatments listed yet.</div>
              )}
            </section>

            {/* 7. FAQ */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle size={24} className="text-teal-600" /> Frequently Asked Questions
              </h2>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {faq.map((item, i) => (
                  <div key={i} className={`p-5 ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <p className="text-sm font-extrabold text-gray-900">{item.q}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mt-2">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT (기존 유지) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              {/* CTA Card */}
              <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-xl">
                <h3 className="font-bold text-lg mb-1">Make an Inquiry</h3>
                <p className="text-xs text-gray-400 mb-6">Direct response within 24 hours.</p>

                <button
                  onClick={() => setView("inquiry")}
                  className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} /> Contact via HEALO
                </button>

                <div className="mt-5 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-teal-600" /> Why contact via HEALO?
                  </p>
                  <ul className="mt-2 space-y-2 text-[11px] text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      Compare options with an itemized estimate
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      Coordinator support for international patients
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                      Consent-based sharing & privacy guidance
                    </li>
                  </ul>
                </div>
              </div>

              {/* Trust & Verification Card */}
              <div
                className={`rounded-2xl p-5 border ${
                  isPartner ? "bg-teal-50 border-teal-100" : "bg-amber-50 border-amber-100"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`shrink-0 mt-0.5 ${isPartner ? "text-teal-700" : "text-amber-700"}`}>
                    <Shield size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                      Trust & Verification
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPartner
                            ? "bg-white/60 text-teal-700 border-teal-200"
                            : "bg-white/60 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isPartner ? "Verified Partner" : "Public Info"}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-600 leading-snug mt-1">
                      {isPartner
                        ? "This clinic has been reviewed for safety & foreign patient coordination standards."
                        : "This page may include publicly available info. Request a plan via HEALO for accurate details."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {trustSignals.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">{item.icon}</div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <p className="text-[11px] text-gray-600 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-black/5">
                  <p className="text-[10px] text-gray-500 leading-snug mt-2">
                    HEALO provides concierge & lead coordination. Final medical decisions and quotes are provided by the clinic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. 문의하기 페이지 (✅ 수정됨: 뒤로가기 로직 개선) ---
export const InquiryPage = ({ setView, mode, setMode, onClose }) => {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! I'm HEALO AI Agent. Ask me about treatments (e.g., 'anti-aging', 'cancer care')." }]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      nationality: '',
      spokenLanguage: '',
      contactMethod: 'WhatsApp', 
      contactId: '',
      treatmentType: '',
      preferredDate: '',
      message: '',
      file: null,
      privacyAgreed: false
  });

  // 👇 [핵심] RAG 시뮬레이션 로직 (프론트엔드 검색)
  const generateAIResponse = (userQuery) => {
      const lowerQuery = userQuery.toLowerCase();
      const cleanQuery = lowerQuery.replace(/[\s-]/g, '');
      
// 1. 인사말 처리 (한국어 + 영어)
      const greetings = ['hello', 'hi', 'hey', 'start', '안녕', '반가워', '하이', '시작'];
      if (greetings.some(greet => lowerQuery.includes(greet))) {
          return "Hello! I represent HEALO. I can recommend treatments for 'Anti-aging', 'Cancer', 'Skin', or 'Checkup'. What are you looking for?";
      }

      // 2. 데이터베이스(TREATMENTS)에서 유연하게 검색 (Retrieval)
      const matches = TREATMENTS.filter(t => {
          const title = t.title.toLowerCase();
          const desc = t.desc.toLowerCase();
          // 태그들도 공백/하이픈 제거하고 비교
          const tags = t.tags.map(tag => tag.toLowerCase().replace(/[\s-]/g, ''));
          
          // 검색 조건: 
          // A. 제목이나 설명에 검색어가 포함되거나
          // B. 태그 중에 '순수 검색어'를 포함하는 게 있거나 (AntiAging vs antiaging)
          return (
              title.includes(lowerQuery) || 
              desc.includes(lowerQuery) ||
              tags.some(tag => tag.includes(cleanQuery)) ||
              title.replace(/[\s-]/g, '').includes(cleanQuery)
          );
      });

      // 3. 답변 생성 (Generation)
      if (matches.length > 0) {
          // 검색 결과가 있을 때 (가장 연관성 높은 첫 번째 항목 추천)
          const bestMatch = matches[0]; 
          return `Based on your interest in "${userQuery}", I highly recommend [${bestMatch.title}] at ${bestMatch.hospital}. \n\nIt is effective for: ${bestMatch.desc}\nEstimated Price: ${bestMatch.price}.\n\nWould you like to proceed with a free consultation?`;
      } else {
          // 결과가 없을 때 (Fallback) - 조금 더 친절하게
          return `I couldn't find exact match for "${userQuery}". \nTry searching for keywords like 'Lifting', 'Cancer', 'Dental', or 'Stem Cell'. Or you can switch to the 'Human Agent' tab for complex inquiries.`;
      }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    // 사용자 메시지 추가
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages); 
    const userQuery = input;
    setInput('');

    // AI 답변 지연 효과 (1초 후 응답)
    setTimeout(() => { 
        const aiResponse = generateAIResponse(userQuery);
        setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]); 
    }, 800);
  };
  
  useEffect(() => { if(chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [messages]);

  const handleBack = () => {
      if (mode === 'select') {
          if (onClose) onClose();
          else setView('home');
      } else {
          setMode('select');
      }
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setFormData({ ...formData, file: file });
      }
  };

  const handleFormSubmit = async () => {
      // 1. 필수값 체크
      const requiredFields = [formData.firstName, formData.lastName, formData.email, formData.spokenLanguage];
      if (requiredFields.some(field => !field?.trim())) {
          alert("Please fill in all required fields (*).");
          return;
      }
      if (!formData.privacyAgreed) {
          alert("Please agree to the Privacy Policy.");
          return;
      }

      try {
          // 2. Supabase(DB)에 데이터 전송! 🚀
          const { error } = await supabase
              .from('inquiries')
              .insert([
                  { 
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    nationality: formData.nationality,
                    spoken_language: formData.spokenLanguage,
                    contact_method: formData.contactMethod,
                    contact_id: formData.contactId,
                    preferred_date: formData.preferredDate,
                    treatment_type: formData.treatmentType,
                    message: formData.message,
                    status: 'pending' // 초기 상태
                  }
              ]);

          if (error) throw error; // 에러 나면 잡아내기

          // 3. 성공 시 페이지 이동
          setView('success');

      } catch (error) {
          console.error('Error:', error);
          alert("Error submitting inquiry. Please try again.");
      }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 text-center animate-in fade-in slide-in-from-bottom-4">
      <button onClick={handleBack} className="flex items-center text-sm font-bold text-gray-500 mb-6 md:mb-8 hover:text-teal-600">
          <ChevronLeft size={16}/> {mode === 'select' ? 'Back' : 'Back to Options'}
      </button>
      
      {mode === 'select' && (
        <>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12">How would you like to proceed?</h1>
          {/* 모바일에서는 gap을 줄이고 패딩도 줄여서 한 화면에 더 많이 보이게 함 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div onClick={() => setMode('ai')} className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer group flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-teal-50 rounded-full flex items-center justify-center md:mb-6 shrink-0 group-hover:bg-teal-100 transition-colors"><Bot size={28} md:size={40} className="text-teal-600" /></div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">AI Agent</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Instant answers & recommendations.</p>
                </div>
            </div>

            <div onClick={() => setMode('human')} className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 hover:border-green-500 hover:shadow-xl transition-all cursor-pointer group flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center md:mb-6 shrink-0 group-hover:bg-green-100 transition-colors"><MessageCircle size={28} md:size={40} className="text-green-600" /></div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Human Agent</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Chat via WhatsApp or Line.</p>
                </div>
            </div>

            <div onClick={() => setMode('form')} className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center md:mb-6 shrink-0 group-hover:bg-blue-100 transition-colors"><ClipboardList size={28} md:size={40} className="text-blue-600" /></div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Inquiry Form</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Get a specific quote via email.</p>
                </div>
            </div>
          </div>
        </>
      )}

{/* ✅ 2. AI 모드 (RAG 로직 + 하단 면책 조항 추가) */}
      {mode === 'ai' && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl h-[600px] flex flex-col p-4 animate-in fade-in slide-in-from-right-4">
           {/* 채팅 영역 */}
           <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-2xl p-4 text-left space-y-4" ref={chatContainerRef}>
             {messages.map((msg, idx) => (
                 <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${msg.role === 'ai' ? 'bg-teal-600' : 'bg-gray-400'}`}> {msg.role === 'ai' ? 'AI' : 'U'} </div>
                     <div className={`p-3 rounded-2xl shadow-sm text-sm border max-w-[80%] ${msg.role === 'ai' ? 'bg-white border-gray-100 rounded-tl-none' : 'bg-teal-600 text-white border-teal-600 rounded-tr-none'}`}> 
                        {/* 줄바꿈 문자(\n)를 처리하기 위해 whitespace-pre-wrap 적용 */}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                     </div>
                 </div>
             ))}
           </div>

           {/* 입력 영역 */}
           <div className="relative">
             <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Ask about 'Lifting' or 'Cancer'..." 
                className="w-full border border-gray-300 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500" 
             />
             <button onClick={handleSend} className="absolute right-2 top-1.5 bg-teal-600 text-white p-1.5 rounded-full hover:bg-teal-700 transition"><ArrowRight size={18}/></button>
           </div>

           {/* ✅ [추가됨] AI 면책 조항 (Disclaimer) */}
           <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-2.5 text-left">
                <AlertCircle size={16} className="text-gray-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-800">Disclaimer:</span> AI may produce inaccurate information. 
                    This is not medical advice. Please consult with our coordinators for confirmation.
                </p>
           </div>
        </div>
      )}

      {mode === 'human' && (
        <div className="animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-8 md:mb-12">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                    <Headset size={28} className="md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Human Agent</h2>
                <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                    Connect directly with our expert medical coordinators.<br className="hidden md:block"/>
                    We reply within 10 mins during business hours.
                </p>
            </div>

            {/* ✅ 모바일: 가로 리스트형 (List) / 데스크탑: 세로 카드형 (Grid) */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6 max-w-md md:max-w-none mx-auto">
                
                {/* 1. WhatsApp */}
                <a href="#" className="group bg-white border border-gray-200 rounded-2xl p-4 md:p-8 hover:border-[#25D366] hover:shadow-xl transition-all cursor-pointer flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
                    {/* 아이콘: 모바일은 작게, PC는 크게 */}
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#25D366]/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-[#25D366]"/>
                    </div>
                    {/* 텍스트 */}
                    <div className="flex-1">
                        <h3 className="text-base md:text-xl font-bold text-gray-900 md:mb-1">WhatsApp</h3>
                        <p className="text-xs md:text-sm text-gray-400 md:mb-6">Global Support</p>
                    </div>
                    {/* 버튼/화살표 */}
                    <div className="text-[#25D366] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        <span className="hidden md:inline">Chat Now</span> <ArrowRight size={20}/>
                    </div>
                </a>

                {/* 2. LINE */}
                <a href="#" className="group bg-white border border-gray-200 rounded-2xl p-4 md:p-8 hover:border-[#06C755] hover:shadow-xl transition-all cursor-pointer flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#06C755]/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-[#06C755]"/>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base md:text-xl font-bold text-gray-900 md:mb-1">LINE</h3>
                        <p className="text-xs md:text-sm text-gray-400 md:mb-6">Japan / Thai</p>
                    </div>
                    <div className="text-[#06C755] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        <span className="hidden md:inline">Chat Now</span> <ArrowRight size={20}/>
                    </div>
                </a>

                {/* 3. WeChat */}
                <a href="#" className="group bg-white border border-gray-200 rounded-2xl p-4 md:p-8 hover:border-[#07C160] hover:shadow-xl transition-all cursor-pointer flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#07C160]/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-[#07C160]"/>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base md:text-xl font-bold text-gray-900 md:mb-1">WeChat</h3>
                        <p className="text-xs md:text-sm text-gray-400 md:mb-6">China Support</p>
                    </div>
                    <div className="text-[#07C160] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        <span className="hidden md:inline">Chat Now</span> <ArrowRight size={20}/>
                    </div>
                </a>
            </div>
        </div>
      )}

      {mode === 'form' && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-5 md:p-8 text-left max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 mb-20">
            {/* mb-20 추가: 하단 네비게이션 바에 가려지지 않게 여백 확보 */}
            
            <div className="mb-6 md:mb-8 border-b border-gray-100 pb-4 md:pb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Inquiry Form</h2>
                <p className="text-gray-500 text-xs md:text-sm">Fill in the details for a personalized quote.</p>
            </div>
            
            <div className="space-y-4 md:space-y-6">
                {/* 1. 이름 (모바일에서도 가로 배치) */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">First Name <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" placeholder="John"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Last Name <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" placeholder="Doe"/>
                    </div>
                </div>

                {/* 2. 이메일 */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" placeholder="your@email.com"/>
                </div>

                {/* 3. 국적 & 언어 (모바일에서도 가로 배치) */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Nationality</label>
                        <input 
                            type="text" 
                            value={formData.nationality} 
                            onChange={(e)=>setFormData({...formData, nationality: e.target.value})} 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" 
                            placeholder="USA"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Spoken Language <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={formData.spokenLanguage} 
                            onChange={(e)=>setFormData({...formData, spokenLanguage: e.target.value})} 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" 
                            placeholder="English"
                        />
                    </div>
                </div>

                {/* 4. 메신저 (Flex로 한 줄 유지) */}
                <div>
                    <label className="block text-xs font-bold text-teal-700 mb-1 ml-1 flex gap-1 items-center">
                        <MessageCircle size={12}/> Messenger
                    </label>
                    <div className="flex gap-2">
                        <select value={formData.contactMethod} onChange={(e)=>setFormData({...formData, contactMethod: e.target.value})} className="w-[35%] p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50 text-gray-700 font-medium">
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="LINE">LINE</option>
                            <option value="WeChat">WeChat</option>
                            <option value="KakaoTalk">KakaoTalk</option>
                        </select>
                        <input 
                            type="text" 
                            value={formData.contactId} 
                            onChange={(e)=>setFormData({...formData, contactId: e.target.value})} 
                            className="w-[65%] p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-white" 
                            placeholder={formData.contactMethod === 'Email' ? "Same as above" : "ID / Phone"}
                        />
                    </div>
                </div>

                {/* 5. 날짜 & 시술 항목 (모바일에서도 가로 배치 시도 - 좁지만 깔끔함) */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Preferred Date</label>
                        <div className="relative">
                            {/* 날짜 입력 트릭: 평소엔 text(YYYY-MM-DD 보임) -> 클릭하면 date(달력 나옴) */}
                            <input 
                                type="text" 
                                placeholder="YYYY-MM-DD"
                                onFocus={(e) => e.target.type = 'date'} 
                                onBlur={(e) => {if(!e.target.value) e.target.type='text'}} 
                                value={formData.preferredDate} 
                                onChange={(e)=>setFormData({...formData, preferredDate: e.target.value})} 
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-xs md:text-sm bg-white text-gray-500 placeholder-gray-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Interest</label>
                        <select value={formData.treatmentType} onChange={(e)=>setFormData({...formData, treatmentType: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-xs md:text-sm bg-white text-gray-700">
                            <option value="">Select...</option>
                            <option value="Plastic Surgery">Plastic Surgery</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Dental">Dental</option>
                            <option value="Vision">Vision</option>
                            <option value="Checkup">Checkup</option>
                            <option value="Cancer">Cancer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* 메시지 영역 */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Message</label>
                    <textarea value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" rows="3" placeholder="Tell us more about your condition..."></textarea>
                </div>

                {/* 파일 업로드 (컴팩트하게) */}
                <div>
                    <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
                    {formData.file ? (
                        <div className="flex items-center justify-between border border-teal-200 bg-teal-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="bg-teal-100 p-1.5 rounded-lg text-teal-600 shrink-0"><File size={16}/></div>
                                <span className="text-xs font-bold text-teal-800 truncate">{formData.file.name}</span>
                            </div>
                            <button onClick={() => setFormData({...formData, file: null})} className="p-1 hover:bg-teal-100 rounded-full text-teal-500"><X size={16}/></button>
                        </div>
                    ) : (
                        <div onClick={() => document.getElementById('fileInput').click()} className="border border-dashed border-gray-300 rounded-xl p-3 text-center hover:bg-gray-50 transition cursor-pointer flex items-center justify-center gap-2">
                            <UploadCloud className="text-gray-400" size={18}/>
                            <span className="text-xs text-gray-500">Upload Photo / Medical Record (Optional)</span>
                        </div>
                    )}
                </div>

                {/* 약관 동의 */}
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <input 
                        type="checkbox" 
                        id="privacyForm" 
                        checked={formData.privacyAgreed}
                        onChange={(e) => setFormData({...formData, privacyAgreed: e.target.checked})}
                        className="mt-0.5 h-4 w-4 cursor-pointer accent-teal-600"
                    />
                    <label htmlFor="privacyForm" className="text-[11px] text-gray-500 cursor-pointer select-none leading-snug">
                        I agree to the <span onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="text-teal-600 font-bold hover:underline">Privacy Policy</span>. <span className="text-red-500">*</span>
                    </label>
                </div>

                <button onClick={handleFormSubmit} className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition transform active:scale-95 shadow-lg shadow-teal-100 mt-2">
                    Send Inquiry
                </button>
            </div>
        </div>
      )}

      {/* 약관 팝업 */}
      <PolicyModal 
          isOpen={activeModal === 'privacy'} 
          onClose={() => setActiveModal(null)} 
          title="Privacy Policy" 
          content={PRIVACY_CONTENT} 
      />
    </div>
  );
};

// ✅ [추가됨] 4. 문의 완료 성공 페이지
export const SuccessPage = ({ setView }) => {
    // 랜덤 접수 번호 생성 (간지용)
    const ticketId = "REQ-" + Math.floor(100000 + Math.random() * 900000);

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
                
                {/* 상단 컬러 라인 (포인트) */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600"></div>

                <div className="p-8 pb-10">
                    {/* 1. 애니메이션 아이콘 */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        {/* 뒤에서 퍼지는 파동 효과 */}
                        <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-20"></div>
                        {/* 메인 아이콘 */}
                        <div className="relative bg-gradient-to-tr from-teal-500 to-teal-400 w-full h-full rounded-full flex items-center justify-center shadow-lg shadow-teal-200 border-4 border-white">
                            <CheckCircle2 size={40} className="text-white" strokeWidth={3} />
                        </div>
                        {/* 깨알 데코 (반짝이) */}
                        <div className="absolute -right-2 -top-1 bg-yellow-400 p-1.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                            <Sparkles size={14} className="text-white" fill="currentColor"/>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Inquiry Received!</h2>
                        <p className="text-gray-500 text-sm">
                            Thank you for choosing HEALO. <br/>We've securely received your request.
                        </p>
                    </div>

                    {/* 2. 접수증 (Ticket Info) */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8 flex flex-col gap-3 relative overflow-hidden">
                        {/* 배경 데코 패턴 */}
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FileText size={64} className="text-gray-900" />
                        </div>

                        <div className="flex justify-between items-center text-sm relative z-10">
                            <span className="text-gray-500 font-medium">Reference ID</span>
                            <span className="font-mono font-bold text-teal-800 bg-teal-100/50 px-2 py-0.5 rounded border border-teal-100">{ticketId}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm relative z-10">
                            <span className="text-gray-500 font-medium">Est. Response</span>
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                <Clock size={14} className="text-teal-500"/> Within 24 Hours
                            </span>
                        </div>
                    </div>

                    {/* 3. 진행 상황 타임라인 (What's Next) */}
                    <div className="text-left mb-8 px-2">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 ml-1">What happens next?</p>
                        <div className="space-y-0 relative pl-2">
                            {/* 연결선 */}
                            <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-gray-100"></div>

                            {/* Step 1 (완료) */}
                            <div className="relative flex gap-4 pb-6">
                                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white shadow-sm">
                                    <Check size={12} className="text-white" strokeWidth={3}/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">Inquiry Submitted</p>
                                    <p className="text-xs text-gray-500">Your details are sent to our medical team.</p>
                                </div>
                            </div>
                            
                            {/* Step 2 (진행중 - 애니메이션) */}
                            <div className="relative flex gap-4 pb-6">
                                <div className="w-6 h-6 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-teal-600 leading-none mb-1">Medical Review</p>
                                    <p className="text-xs text-gray-500">Coordinator is matching the best hospital.</p>
                                </div>
                            </div>

                            {/* Step 3 (예정) */}
                            <div className="relative flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                                    <MessageCircle size={12} className="text-gray-400"/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 leading-none mb-1">Personalized Quote</p>
                                    <p className="text-xs text-gray-400">You'll receive a quote via your contact method.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. 하단 버튼 */}
                    <div className="space-y-3">
                        <button 
                            onClick={() => setView('home')} 
                            className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-100 transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. 로그인 페이지 ---
export const LoginPage = ({ setView }) => {
    // 비밀번호 보이기/숨기기 상태 관리
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome to HEALO</h2>
                    <p className="text-gray-500 mt-2">Start Your Journey</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                            <input type="email" placeholder="name@example.com" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"/>
                        </div>
                    </div>
                    
                    {/* 비밀번호 영역 수정됨 */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-bold text-gray-700">Password</label>
                            <span className="text-xs text-teal-600 font-bold cursor-pointer hover:underline">Forgot?</span>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                            <input 
                                type={showPassword ? "text" : "password"} // 상태에 따라 type 변경
                                placeholder="••••••••" 
                                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
                            />
                            {/* 눈 모양 아이콘 추가 */}
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                    </div>
                    
                    <button onClick={() => { alert('Logged In!'); setView('home'); }} className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-100">
                        Log In
                    </button>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-8">
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs mb-1 group-hover:scale-110 transition">G</div>
                        <span className="text-[10px] font-bold text-gray-500">Google</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold text-xs mb-1 group-hover:scale-110 transition">A</div>
                        <span className="text-[10px] font-bold text-gray-500">Apple</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#07C160] font-bold text-xs mb-1 group-hover:scale-110 transition">W</div>
                        <span className="text-[10px] font-bold text-gray-500">WeChat</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#06C755] font-bold text-xs mb-1 group-hover:scale-110 transition">L</div>
                        <span className="text-[10px] font-bold text-gray-500">LINE</span>
                    </button>
                </div>

                <div className="text-center text-sm text-gray-500">
                    Don't have an account? <span onClick={() => setView('signup')} className="text-teal-600 font-bold cursor-pointer hover:underline">Sign Up</span>
                </div>
            </div>
        </div>
    );
};

// --- 5. 회원가입 페이지 ---
export const SignUpPage = ({ setView }) => {
    const [isAgreed, setIsAgreed] = useState(false); // 필수 약관
    const [isMarketing, setIsMarketing] = useState(false); // 마케팅 약관
    const [activeModal, setActiveModal] = useState(null);
    
    // 비밀번호 입력값 및 토글 상태 관리
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = () => {
        if (!isAgreed) {
            alert("Please agree to the Terms and Privacy Policy.");
            return;
        }
        if (password.length < 8) {
            alert("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        
        alert('Account Created! Welcome to HEALO.'); 
        setView('home');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join HEALO for exclusive benefits</p>
                </div>

                {/* 1. 입력 폼 섹션 (위로 올림) */}
                <div className="space-y-4">
                    {/* 이름 필드 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">First Name</label>
                            <input type="text" placeholder="John" className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Last Name</label>
                            <input type="text" placeholder="Doe" className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"/>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 px-1 -mt-2">
                        Make sure this matches the name on your passport.
                    </p>

                    <div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                            <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"/>
                        </div>
                    </div>
                    
                    {/* 비밀번호 입력 */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password (Min. 8 chars)" 
                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>

                    {/* 비밀번호 확인 입력 */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password" 
                            className={`w-full pl-12 pr-12 py-3 rounded-xl border focus:ring-2 outline-none transition text-sm ${
                                confirmPassword && password !== confirmPassword 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                : 'border-gray-200 focus:border-teal-500 focus:ring-teal-100'
                            }`}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] text-red-500 px-1 -mt-2">Passwords do not match.</p>
                    )}

                    {/* 약관 동의 */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3">
                            <div className="relative flex items-center pt-0.5">
                                <input 
                                    type="checkbox" 
                                    id="terms" 
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-teal-600 checked:bg-teal-600"
                                />
                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 peer-checked:opacity-100">
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            </div>
                            <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer select-none leading-snug">
                                I agree to the <span onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="text-teal-600 font-bold hover:underline">Terms</span> and <span onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="text-teal-600 font-bold hover:underline">Privacy Policy</span>. <span className="text-red-500">*</span>
                            </label>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="relative flex items-center pt-0.5">
                                <input 
                                    type="checkbox" 
                                    id="marketing" 
                                    checked={isMarketing}
                                    onChange={(e) => setIsMarketing(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-teal-600 checked:bg-teal-600"
                                />
                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 peer-checked:opacity-100">
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            </div>
                            <label htmlFor="marketing" className="text-xs text-gray-500 cursor-pointer select-none leading-snug">
                                I want to receive marketing emails including exclusive medical deals.
                            </label>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleSignUp} 
                        className={`w-full font-bold py-3.5 rounded-xl transition shadow-lg ${isAgreed ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* 2. 구분선 (아래로 이동) */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">Or continue with</span></div>
                </div>

                {/* 3. 소셜 로그인 (아래로 이동) */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs mb-1 group-hover:scale-110 transition">G</div>
                        <span className="text-[10px] font-bold text-gray-500">Google</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold text-xs mb-1 group-hover:scale-110 transition">A</div>
                        <span className="text-[10px] font-bold text-gray-500">Apple</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#07C160] font-bold text-xs mb-1 group-hover:scale-110 transition">W</div>
                        <span className="text-[10px] font-bold text-gray-500">WeChat</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition group">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#06C755] font-bold text-xs mb-1 group-hover:scale-110 transition">L</div>
                        <span className="text-[10px] font-bold text-gray-500">LINE</span>
                    </button>
                </div>

                <div className="text-center text-sm text-gray-500">
                    Already have an account? <span onClick={() => setView('login')} className="text-teal-600 font-bold cursor-pointer hover:underline">Log In</span>
                </div>
            </div>

            <PolicyModal 
                isOpen={activeModal === 'terms'} 
                onClose={() => setActiveModal(null)} 
                title="Terms of Service" 
                content={TERMS_CONTENT} 
            />
            <PolicyModal 
                isOpen={activeModal === 'privacy'} 
                onClose={() => setActiveModal(null)} 
                title="Privacy Policy" 
                content={PRIVACY_CONTENT} 
            />
        </div>
    );
};

// --- 6. 관리자 페이지 ---
export const AdminPage = ({ setView }) => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-4">
        <h3 className="font-bold flex gap-2"><PlusCircle/> Add Hospital</h3>
        <button onClick={() => alert('Saved!')} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold flex justify-center gap-2"><Save size={20}/> Save</button>
      </div>
      <button onClick={() => setView('home')} className="mt-4 text-gray-500 underline">Back to Home</button>
    </div>
);