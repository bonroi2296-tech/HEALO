"use client";

// src/pages/InquiryPage.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, Bot, MessageCircle, ClipboardList, ArrowRight, AlertCircle, Headset, UploadCloud, File, X, Check } from 'lucide-react';
import { PRIVACY_CONTENT, TERMS_CONTENT } from '../lib/policyContent';
import { supabase } from '../supabase'; 
import { PolicyModal } from '../components/Modals';
import { useToast } from '../components/Toast';
import { getLangCodeFromCookie } from '../lib/i18n';
import { event } from '../lib/ga';
import { useChat } from 'ai/react';

// ✅ [수정 1] props에 treatments 추가 (App.jsx에서 받아옴)
export const InquiryPage = ({ setView, mode, setMode, onClose, treatments }) => {
  const toast = useToast(); // Toast 사용 준비
  
  // ✅ DB 데이터만 사용
  const allTreatments = Array.isArray(treatments) ? treatments : [];
  
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    append,
    error: chatError,
  } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'intro',
        role: 'assistant',
        content:
          "Hello! I'm HEALO AI Agent. Ask me about treatments (e.g., 'anti-aging', 'cancer care').",
      },
    ],
  });
  const chatContainerRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null);
  const lastChatErrorRef = useRef(null);
  const sessionId = useMemo(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  const getUtmParams = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const utm = {};
    keys.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
    });
    return Object.keys(utm).length ? utm : null;
  };

  // 폼 상태 관리 (Step1: 5필수 + message 선택)
  const [formData, setFormData] = useState({
      firstName: '', lastName: '', email: '', nationality: '', spokenLanguage: '',
      contactMethod: '', contactId: '', treatmentType: '', preferredDate: '',
      preferredDateFlex: false,
      message: '', file: null, privacyAgreed: false
  });
  
  // ✅ 실시간 검증 에러 상태
  const [emailError, setEmailError] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const lang = getLangCodeFromCookie();
    const page = typeof window !== 'undefined' ? window.location.pathname : null;
    const utm = getUtmParams();
    append(
      { role: 'user', content: trimmed },
      { body: { lang, session_id: sessionId, page, utm } }
    ).catch(() => {
      toast.error("AI response failed. Please try again.");
    });
    setInput('');
  };
  
  useEffect(() => {
    if (!chatError) {
      lastChatErrorRef.current = null;
      return;
    }
    if (lastChatErrorRef.current === chatError) return;
    lastChatErrorRef.current = chatError;
    toast.error("AI response failed. Please try again.");
  }, [chatError, toast]);

  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  // ✅ Funnel 이벤트: /inquiry 진입 시 step1_viewed
  useEffect(() => {
    if (mode === 'form') {
      fetch('/api/inquiries/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'step1_viewed' }),
      }).catch(() => {});
    }
  }, [mode]);

  const handleBack = () => {
      if (mode === 'select') { if (onClose) onClose(); else setView('home'); } else { setMode('select'); }
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setFormData({ ...formData, file: file });
      }
  };

  const handleFormSubmit = async () => {
    // Step1 필수 5개: treatment_type, nationality, spoken_language, contact(이메일 OR method+id), preferred(날짜 OR flex)
    const hasContact = (formData.email?.trim()) || (formData.contactMethod && formData.contactId?.trim());
    const hasPreferred = !!(formData.preferredDate?.trim()) || !!formData.preferredDateFlex;
    if (!formData.treatmentType?.trim()) { toast.error("Please select Main Concern."); return; }
    if (!formData.nationality?.trim()) { toast.error("Please enter Nationality."); return; }
    if (!formData.spokenLanguage?.trim()) { toast.error("Please enter Spoken Language."); return; }
    if (!hasContact) { toast.error("Please provide Email or Messenger (method + ID)."); return; }
    if (!hasPreferred) { toast.error("Please set Preferred Date or check Flexible."); return; }
    
    // ✅ 이메일 형식 검증 (이메일이 입력된 경우) - 정규식 사용
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address (e.g., example@email.com)");
      setEmailError('Please enter a valid email address (e.g., example@email.com)');
      return;
    }
    
    if (!formData.privacyAgreed) {
      toast.error("Please agree to the Privacy Policy.");
      return;
    }

    try {
        let attachmentPath = null;
        let attachmentsList = [];
        if (formData.file) {
            const filePath = `inquiry/${Date.now()}_${formData.file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, formData.file);
            if (uploadError) throw uploadError;
            attachmentPath = filePath;
            attachmentsList = [
              { path: filePath, name: formData.file.name, type: formData.file.type || null },
            ];
        }

        const preferredDateVal = formData.preferredDateFlex ? null : (formData.preferredDate
          ? new Date(formData.preferredDate).toISOString().split('T')[0]
          : null);

        // 🔒 RLS 보안: 서버 API 경유로 변경 (클라이언트 직접 insert 차단)
        // Before: supabase.from('inquiries').insert() (RLS에 의해 차단됨)
        // After: /api/inquiries/create (service_role로 RLS 우회)
        const createResponse = await fetch('/api/inquiries/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName || null,
            lastName: formData.lastName || null,
            email: formData.email || null,
            nationality: formData.nationality,
            spokenLanguage: formData.spokenLanguage,
            contactMethod: formData.contactMethod || null,
            contactId: formData.contactId || null,
            treatmentType: formData.treatmentType,
            preferredDate: preferredDateVal,
            preferredDateFlex: !!formData.preferredDateFlex,
            message: formData.message || null,
            attachment: attachmentPath,
            attachments: attachmentsList,
          }),
        });

        const createResult = await createResponse.json();

        if (!createResult.ok) {
          // 🔧 에러 타입에 따라 구체적인 메시지 표시
          let errorMessage = 'Failed to submit inquiry. Please try again.';
          
          switch (createResult.error) {
            case 'invalid_email':
              errorMessage = 'Please enter a valid email address (e.g., example@email.com)';
              break;
            case 'missing_contact':
              errorMessage = 'Please provide either Email or Messenger contact information';
              break;
            case 'missing_required_fields':
              errorMessage = 'Please fill in all required fields';
              break;
            case 'rate_limit_exceeded':
              errorMessage = `Too many requests. Please try again in ${createResult.retryAfter || 60} seconds`;
              break;
            case 'encryption_failed':
              errorMessage = 'Security error occurred. Please contact support';
              break;
            default:
              errorMessage = createResult.detail || createResult.error || 'Failed to submit inquiry';
          }
          
          throw new Error(errorMessage);
        }

        const inquiryId = createResult.inquiryId;
        const publicToken = createResult.publicToken;

        // ✅ RAG 시스템을 위한 normalize API 호출
        if (inquiryId) {
          try {
            const res = await fetch('/api/inquiry/normalize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                inquiry_id: inquiryId,
                source_type: 'inquiry_form',
                source_inquiry_id: inquiryId,
              }),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              console.error('[InquiryForm] normalize API error:', res.status, j);
            } else {
              console.log('[InquiryForm] ✅ normalize API success');
            }
          } catch (e) {
            console.error('[InquiryForm] normalize call failed:', e);
          }
        }

        if (typeof window !== 'undefined' && inquiryId != null && publicToken != null) {
          try {
            sessionStorage.setItem('inquiry_success', JSON.stringify({ inquiryId, publicToken: String(publicToken) }));
          } catch (_) {}
        }

        // ✅ Funnel 이벤트: Step1 제출 성공
        if (inquiryId != null) {
          fetch('/api/inquiries/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType: 'step1_submitted', inquiryId }),
          }).catch(() => {});
        }

        const submitLang = getLangCodeFromCookie();
        if (submitLang) {
          const isLikelySlug =
            typeof formData.treatmentType === "string" &&
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.treatmentType);
          const treatmentSlug = isLikelySlug ? formData.treatmentType : null;
          event("submit_inquiry", { source_type: "inquiry_form", treatment_slug: treatmentSlug, lang: submitLang });
        }
        setView('success');
    } catch (error) {
        console.error('Error:', error);
        // ✅ API에서 받은 구체적인 에러 메시지 표시
        toast.error(error.message || "Failed to submit inquiry. Please try again.");
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div
                onClick={() => {
                  const startLang = getLangCodeFromCookie();
                  if (startLang) {
                    event("start_inquiry", {
                      source_type: "ai_agent",
                      lang: startLang,
                    });
                  }
                  setMode('ai');
                }}
                className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer group flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0"
            >
                <div className="w-14 h-14 md:w-20 md:h-20 bg-teal-50 rounded-full flex items-center justify-center md:mb-6 shrink-0 group-hover:bg-teal-100 transition-colors"><Bot size={28} className="text-teal-600 md:w-10 md:h-10" /></div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">AI Agent</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Instant answers & recommendations.</p>
                </div>
            </div>

            <div onClick={() => setMode('human')} className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 hover:border-green-500 hover:shadow-xl transition-all cursor-pointer group flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center md:mb-6 shrink-0 group-hover:bg-green-100 transition-colors"><MessageCircle size={28} className="text-green-600 md:w-10 md:h-10" /></div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Human Agent</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Chat via WhatsApp or Line.</p>
                </div>
            </div>

            <div
                onClick={() => {
                  const startLang = getLangCodeFromCookie();
                  if (startLang) {
                    event("start_inquiry", {
                      source_type: "inquiry_form",
                      lang: startLang,
                    });
                  }
                  setMode('form');
                }}
                className="bg-white border border-teal-100 rounded-3xl p-6 md:p-8 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-0"
            >
                <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center md:mb-6 shrink-0 group-hover:bg-blue-100 transition-colors"><ClipboardList size={28} className="text-blue-600 md:w-10 md:h-10" /></div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Inquiry Form</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Get a specific quote via email.</p>
                </div>
            </div>
          </div>
        </>
      )}

      {mode === 'ai' && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl h-[600px] flex flex-col p-4 animate-in fade-in slide-in-from-right-4">
           <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-2xl p-4 text-left space-y-4" ref={chatContainerRef}>
             {messages.map((msg) => {
                 const partText = Array.isArray(msg.parts)
                   ? msg.parts
                       .filter((p) => p.type === 'text')
                       .map((p) => p.text)
                       .join('')
                   : '';
                 const displayText = msg.content || partText || '';
                 return (
                 <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${msg.role === 'assistant' ? 'bg-teal-600' : 'bg-gray-400'}`}> {msg.role === 'assistant' ? 'AI' : 'U'} </div>
                     <div className={`p-3 rounded-2xl shadow-sm text-sm border max-w-[80%] ${msg.role === 'assistant' ? 'bg-white border-gray-100 rounded-tl-none' : 'bg-teal-600 text-white border-teal-600 rounded-tr-none'}`}> 
                        <p className="whitespace-pre-wrap">{displayText}</p>
                     </div>
                 </div>
             );
             })}
           </div>

           <div className="relative">
             <input 
               type="text" 
               value={input} 
               onChange={handleInputChange} 
               onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
               placeholder="Ask about 'Lifting' or 'Cancer'..." 
               className="w-full border border-gray-300 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500" 
             />
             <button onClick={handleSend} className="absolute right-2 top-1.5 bg-teal-600 text-white p-1.5 rounded-full hover:bg-teal-700 transition"><ArrowRight size={18}/></button>
           </div>

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

            <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6 max-w-md md:max-w-none mx-auto">
                <a href="#" className="group bg-white border border-gray-200 rounded-2xl p-4 md:p-8 hover:border-[#25D366] hover:shadow-xl transition-all cursor-pointer flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#25D366]/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-[#25D366]"/>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base md:text-xl font-bold text-gray-900 md:mb-1">WhatsApp</h3>
                        <p className="text-xs md:text-sm text-gray-400 md:mb-6">Global Support</p>
                    </div>
                    <div className="text-[#25D366] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        <span className="hidden md:inline">Chat Now</span> <ArrowRight size={20}/>
                    </div>
                </a>
                
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
            <div className="mb-6 md:mb-8 border-b border-gray-100 pb-4 md:pb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Inquiry Form</h2>
                <p className="text-gray-500 text-xs md:text-sm">Fill in the details for a personalized quote.</p>
            </div>
            
            <div className="space-y-4 md:space-y-6">
                {/* 이름 (선택) */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">First Name</label>
                        <input type="text" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" placeholder="John"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Last Name</label>
                        <input type="text" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" placeholder="Doe"/>
                    </div>
                </div>

                {/* 연락: 이메일 OR 메신저 (둘 중 하나 필수) */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Email <span className="text-gray-400 font-normal">(or Messenger below)</span></label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, email: value});
                        
                        // ✅ 실시간 이메일 검증 (정규식)
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (value && !emailRegex.test(value)) {
                          setEmailError('Please enter a valid email address (e.g., example@email.com)');
                        } else {
                          setEmailError('');
                        }
                      }}
                      className={`w-full p-3 rounded-xl border ${emailError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'} outline-none transition text-sm bg-gray-50/50`}
                      placeholder="your@email.com"
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {emailError}
                      </p>
                    )}
                </div>

                {/* 메신저: 선택 시에만 ID 입력칸 노출 */}
                <div>
                    <label className="block text-xs font-bold text-teal-700 mb-1 ml-1 flex gap-1 items-center">
                        <MessageCircle size={12}/> Messenger
                    </label>
                    <select value={formData.contactMethod} onChange={(e)=>setFormData({...formData, contactMethod: e.target.value})} className="w-full md:w-[35%] p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50 text-gray-700 font-medium">
                        <option value="">Select...</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="LINE">LINE</option>
                        <option value="WeChat">WeChat</option>
                        <option value="KakaoTalk">KakaoTalk</option>
                    </select>
                    {formData.contactMethod && (
                        <input type="text" value={formData.contactId} onChange={(e)=>setFormData({...formData, contactId: e.target.value})} className="mt-2 w-full md:w-[65%] p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-white" placeholder="ID / Phone"/>
                    )}
                </div>

                {/* 국적 & 언어 */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Nationality <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.nationality} onChange={(e)=>setFormData({...formData, nationality: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" placeholder="USA"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Spoken Language <span className="text-red-500">*</span></label>
                        <input type="text" value={formData.spokenLanguage} onChange={(e)=>setFormData({...formData, spokenLanguage: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-sm bg-gray-50/50" placeholder="English"/>
                    </div>
                </div>

                {/* 날짜 & Main Concern */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Preferred Date <span className="text-red-500">*</span></label>
                        <input type="date" value={formData.preferredDate || ''} onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })} disabled={!!formData.preferredDateFlex} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-xs md:text-sm bg-white text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"/>
                        <label className="mt-2 flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!formData.preferredDateFlex} onChange={(e) => setFormData({ ...formData, preferredDateFlex: e.target.checked, preferredDate: e.target.checked ? '' : formData.preferredDate })} className="rounded accent-teal-600"/>
                            <span className="text-[11px] text-gray-500">Flexible (no specific date)</span>
                        </label>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Main Concern <span className="text-red-500">*</span></label>
                        <select value={formData.treatmentType} onChange={(e)=>setFormData({...formData, treatmentType: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 outline-none transition text-xs md:text-sm bg-white text-gray-700">
                            <option value="">Select...</option>
                            <option value="chronic-fatigue-low-immunity">Chronic fatigue / low immunity</option>
                            <option value="digestive-problems">Digestive problems</option>
                            <option value="sleep-disorder-insomnia">Sleep disorder / insomnia</option>
                            <option value="stress-related-symptoms">Stress-related symptoms</option>
                            <option value="hormonal-imbalance">Hormonal imbalance</option>
                            <option value="post-illness-recovery">Post-illness recovery</option>
                            <option value="unexplained-chronic-symptoms">Unexplained chronic symptoms</option>
                            <option value="skin-problem">Skin problem (acne, rash, pigmentation)</option>
                            <option value="pain-management">Pain management (neck, back, joints)</option>
                            <option value="digestive-weight-management">Digestive & weight management</option>
                            <option value="general-health-checkup">General health check-up</option>
                            <option value="dental-problem">Dental problem</option>
                            <option value="vision-eye-problem">Vision or eye problem</option>
                            <option value="cosmetic-aesthetic">Cosmetic / aesthetic concern</option>
                            <option value="abnormal-test-suspected-cancer">Abnormal test result / suspected cancer</option>
                            <option value="other-medical-concern">Other medical concern</option>
                        </select>
                    </div>
                </div>

                {/* 메시지 (선택, 권장) */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Message <span className="text-gray-400 font-normal">(optional, recommended)</span></label>
                    {/* TODO: Main Concern별 placeholder 확장 (e.g. pain-management, vision-eye-problem 등) */}
                    <textarea
                      value={formData.message}
                      onChange={(e)=>setFormData({...formData, message: e.target.value})}
                      className="w-full border border-gray-200 p-3 rounded-xl focus:border-teal-500 outline-none transition text-sm bg-gray-50/50"
                      rows="4"
                      placeholder={
                        formData.treatmentType === 'skin-problem'
                          ? "When did the skin issue start? Which area is affected?"
                          : formData.treatmentType === 'dental-problem'
                          ? "Which tooth or area is painful?"
                          : "e.g. Back pain for 2 weeks; no prior diagnosis."
                      }
                    />
                    <p className="mt-1 ml-1 text-[11px] text-gray-500 leading-relaxed">
                      {formData.treatmentType === 'skin-problem' ? (
                        <>
                          • When did it start?
                          <br />
                          • Which area is affected?
                        </>
                      ) : formData.treatmentType === 'dental-problem' ? (
                        <>
                          • Which tooth or area?
                          <br />
                          • Any pain or sensitivity?
                        </>
                      ) : (
                        <>
                          • What symptom or concern you have
                          <br />
                          • Which body part is affected
                          <br />
                          • Since when (days / weeks / months)
                          <br />
                          • Any previous diagnosis or test results (if any)
                        </>
                      )}
                    </p>

                </div>

                {/* 파일 업로드 */}
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
                            <span className="text-xs text-gray-500">Upload photo or medical record (X-ray, test result, diagnosis note if available)</span>
                        </div>
                    )}
                </div>

                {/* 약관 동의 */}
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <input type="checkbox" id="privacyForm" checked={formData.privacyAgreed} onChange={(e) => setFormData({...formData, privacyAgreed: e.target.checked})} className="mt-0.5 h-4 w-4 cursor-pointer accent-teal-600"/>
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
      <PolicyModal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Privacy Policy" content={PRIVACY_CONTENT} />
    </div>
  );
};