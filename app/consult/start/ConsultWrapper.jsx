"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '../../../src/components/Toast';
import { getLangCodeFromCookie } from '../../../src/lib/i18n';
import { event } from '../../../src/lib/ga';

export default function ConsultWrapper() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // 간소화된 폼 데이터
  const [formData, setFormData] = useState({
    concern: '',
    country: '',
    timing: '',
    contactMethod: '',
    contactId: '',
  });

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.concern?.trim()) {
      toast.error("Please describe your concern or treatment interest.");
      return;
    }
    if (!formData.country?.trim()) {
      toast.error("Please enter your country.");
      return;
    }
    if (!formData.timing) {
      toast.error("Please select your preferred timing.");
      return;
    }
    if (!formData.contactMethod || !formData.contactId?.trim()) {
      toast.error("Please provide your contact information.");
      return;
    }

    setLoading(true);

    try {
      // 간소화된 문의 생성 (기존 API 재사용)
      const createResponse = await fetch('/api/inquiries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: null,
          lastName: null,
          email: null,
          nationality: formData.country,
          spokenLanguage: 'English', // 기본값
          contactMethod: formData.contactMethod,
          contactId: formData.contactId,
          treatmentType: 'consult-beta', // 실험용 식별자
          preferredDate: null,
          preferredDateFlex: true,
          message: `[Beta Consult]\nConcern: ${formData.concern}\nTiming: ${formData.timing}`,
          attachment: null,
          attachments: [],
        }),
      });

      const createResult = await createResponse.json();

      if (!createResult.ok) {
        throw new Error(createResult.error || 'Failed to submit consultation request.');
      }

      // Analytics 이벤트
      const submitLang = getLangCodeFromCookie();
      if (submitLang) {
        event("submit_inquiry", { 
          source_type: "consult_beta", 
          lang: submitLang 
        });
      }

      // 성공 화면으로 전환
      setSubmitted(true);
      
    } catch (error) {
      console.error('Consult submission error:', error);
      toast.error(error.message || "Failed to submit. Please try again.");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
          {/* 상단 컬러 라인 */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600"></div>

          <div className="p-8 pb-10">
            {/* 애니메이션 아이콘 */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-gradient-to-tr from-teal-500 to-teal-400 w-full h-full rounded-full flex items-center justify-center shadow-lg shadow-teal-200 border-4 border-white">
                <CheckCircle2 size={40} className="text-white" strokeWidth={3} />
              </div>
              <div className="absolute -right-2 -top-1 bg-yellow-400 p-1.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                <Sparkles size={14} className="text-white" fill="currentColor"/>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Case Received!</h2>
              <p className="text-gray-500 text-sm">
                Your case is being reviewed.<br/>
                A coordinator will contact you shortly.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="font-bold text-teal-600 bg-teal-100/50 px-3 py-1 rounded-lg border border-teal-100">
                  Under Review
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                We'll reach you via {formData.contactMethod} within 24 hours.
              </div>
            </div>

            <button 
              onClick={() => router.push('/')} 
              className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-100 transform active:scale-[0.98]"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-lg w-full">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-sm font-bold text-gray-500 mb-6 hover:text-teal-600"
        >
          <ChevronLeft size={16}/> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-block bg-teal-50 text-teal-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
              Beta
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Start Consultation
            </h1>
            <p className="text-gray-500 text-sm">
              Tell us what you need. We'll guide you to the best next step.
            </p>
          </div>

          {/* 간소화된 폼 */}
          <div className="space-y-5">
            {/* Concern / Treatment */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                What brings you to HEALO? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.concern}
                onChange={(e) => setFormData({...formData, concern: e.target.value})}
                className="w-full border border-gray-200 p-3 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm bg-gray-50/50"
                rows="3"
                placeholder="e.g. Looking for cancer treatment options, Need skin procedure consultation, General health check-up..."
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm bg-gray-50/50"
                placeholder="e.g. USA, Japan, UAE..."
              />
            </div>

            {/* Timing */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                When do you need this? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'asap', label: 'ASAP' },
                  { value: '1-3months', label: '1–3 months' },
                  { value: 'later', label: 'Later' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({...formData, timing: option.value})}
                    className={`p-3 rounded-xl border-2 font-semibold text-sm transition ${
                      formData.timing === option.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Method */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                How should we contact you? <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.contactMethod}
                onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm bg-white text-gray-700 font-medium mb-2"
              >
                <option value="">Select method...</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="LINE">LINE</option>
                <option value="WeChat">WeChat</option>
                <option value="Email">Email</option>
              </select>
              
              {formData.contactMethod && (
                <input
                  type="text"
                  value={formData.contactId}
                  onChange={(e) => setFormData({...formData, contactId: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition text-sm bg-white"
                  placeholder={
                    formData.contactMethod === 'Email' 
                      ? 'your@email.com' 
                      : 'Phone number or ID'
                  }
                />
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-800 leading-relaxed">
                <span className="font-bold">What happens next:</span> Our medical coordinator will review your case and contact you with personalized recommendations within 24 hours.
              </p>
            </div>

            {/* Submit 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:bg-gray-400 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? 'Submitting...' : 'Connect me'}
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-xs text-gray-500 mt-6">
          This is a beta feature. Your information is encrypted and handled securely.
        </p>
      </div>
    </div>
  );
}
