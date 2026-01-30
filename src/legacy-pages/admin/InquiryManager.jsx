import React, { useState } from 'react';
import { RefreshCw, Paperclip, Eye, X, Loader2 } from 'lucide-react';
import { formatDate } from "../../lib/i18n/format";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";

const supabase = createSupabaseBrowserClient();

export const InquiryManager = ({ inquiries, fetchInquiries, handleStatusChange, handleFileClick }) => {
  // 🔐 상세 조회 모달 상태
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // 🔬 실험용 번역 상태
  const [translationResult, setTranslationResult] = useState(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  
  // 🔐 단건 상세 조회 (서버에서 복호화)
  const handleViewDetail = async (inquiryId) => {
    setLoadingDetail(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        alert('⚠️ 세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }
      
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.ok) {
        setSelectedInquiry(result.inquiry);
      } else {
        alert(`상세 조회 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('[InquiryManager] Detail fetch error:', error);
      alert('상세 조회 중 오류가 발생했습니다.');
    } finally {
      setLoadingDetail(false);
    }
  };
  
  const closeDetailModal = () => {
    setSelectedInquiry(null); // 평문 즉시 제거
    setTranslationResult(null); // 번역 결과도 제거
  };
  
  // 🔬 실험용 번역 실행
  const handleExperimentalTranslation = async () => {
    if (!selectedInquiry?.message) {
      alert('번역할 메시지가 없습니다.');
      return;
    }
    
    setLoadingTranslation(true);
    setTranslationResult(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        alert('⚠️ 세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
      }
      
      const response = await fetch('/api/admin/experimental/translate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: selectedInquiry.message,
          sourceLang: 'en',
          targetLang: 'ko',
        }),
      });
      
      const result = await response.json();
      
      if (result.ok) {
        setTranslationResult(result.result);
      } else {
        alert(`번역 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('[InquiryManager] Translation error:', error);
      alert('번역 중 오류가 발생했습니다.');
    } finally {
      setLoadingTranslation(false);
    }
  };
  const InquiryRow = ({ item }) => (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 text-gray-500 text-sm">
        {formatDate(item.created_at, "en")}
      </td>
      <td className="px-6 py-4">
        <div className="font-bold text-gray-400">
          {item.first_name} {item.last_name}
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">마스킹</span>
        </div>
        <div className="text-xs text-gray-400">{item.email}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        <div>{item.treatment_type}</div>
        <div className="text-xs text-gray-400">{item.contact_method}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        <div>{item.nationality || '-'}</div>
        <div className="text-xs">
          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
            item.status === 'received' ? 'bg-blue-100 text-blue-700' :
            item.status === 'normalized' ? 'bg-green-100 text-green-700' :
            item.status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {item.status || 'received'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => handleViewDetail(item.id)}
          className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-lg transition"
          disabled={loadingDetail}
        >
          <Eye size={14} />
          상세보기
        </button>
      </td>
    </tr>
  );

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">고객 문의 현황</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            🔒 목록은 마스킹됩니다. "상세보기"로 평문 확인
          </span>
          <button onClick={fetchInquiries}><RefreshCw/></button>
        </div>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">날짜</th>
              <th className="px-6 py-3">고객 정보</th>
              <th className="px-6 py-3">관심 분야</th>
              <th className="px-6 py-3">국가/상태</th>
              <th className="px-6 py-3">액션</th>
            </tr>
          </thead>
          <tbody>{inquiries.map(i => <InquiryRow key={i.id} item={i}/>)}</tbody>
        </table>
      </div>
      
      {/* 🔐 상세 조회 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-teal-50 to-blue-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Inquiry Detail</h2>
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 이 조회는 감사 로그에 기록됩니다 (복호화된 개인정보 열람)
                </p>
              </div>
              <button 
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* 내용 */}
            <div className="p-6 space-y-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">ID</label>
                  <div className="text-sm text-gray-800">{selectedInquiry.id}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Created At</label>
                  <div className="text-sm text-gray-800">{formatDate(selectedInquiry.created_at, "en")}</div>
                </div>
              </div>
              
              {/* 🔓 복호화된 개인정보 */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-bold text-teal-600 mb-3 flex items-center gap-2">
                  <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs">복호화됨</span>
                  개인정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">First Name</label>
                    <div className="text-sm text-gray-800">{selectedInquiry.first_name || '-'}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Last Name</label>
                    <div className="text-sm text-gray-800">{selectedInquiry.last_name || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                    <div className="text-sm text-gray-800">{selectedInquiry.email || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* 문의 내용 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 uppercase font-bold">Message</label>
                  <button
                    onClick={handleExperimentalTranslation}
                    disabled={loadingTranslation || !selectedInquiry.message}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingTranslation ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        번역 중...
                      </>
                    ) : (
                      <>
                        🔬 번역 실험
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-800 max-h-40 overflow-y-auto">
                  {selectedInquiry.message || '-'}
                </div>
              </div>
              
              {/* 🔬 실험용 번역 결과 */}
              {translationResult && (
                <div className="border-t pt-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
                        🔬 번역 비교 (실험용)
                      </h3>
                      <span className="text-xs text-purple-600 italic">자동 번역 · 참고용</span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Model A */}
                      <div>
                        <label className="text-xs text-purple-600 font-bold uppercase">Model A (오픈소스)</label>
                        <div className="mt-1 p-3 bg-white rounded border border-purple-200 text-sm text-gray-800">
                          {translationResult.translationA}
                        </div>
                      </div>
                      
                      {/* Model B */}
                      <div>
                        <label className="text-xs text-purple-600 font-bold uppercase">Model B (외부 API)</label>
                        <div className="mt-1 p-3 bg-white rounded border border-purple-200 text-sm text-gray-800">
                          {translationResult.translationB}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-purple-600">
                        ⚠️ 이 번역 결과는 품질 비교를 위한 실험용입니다. 
                        DB에 저장되지 않으며, RAG 시스템에도 사용되지 않습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 메타데이터 */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-bold text-gray-600 mb-3">추가 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-gray-500 uppercase font-bold">Treatment Type</label>
                    <div className="text-gray-800">{selectedInquiry.treatment_type || '-'}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 uppercase font-bold">Contact Method</label>
                    <div className="text-gray-800">{selectedInquiry.contact_method || '-'}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 uppercase font-bold">Nationality</label>
                    <div className="text-gray-800">{selectedInquiry.nationality || '-'}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 uppercase font-bold">Status</label>
                    <div className="text-gray-800">{selectedInquiry.status || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* 첨부파일 */}
              {selectedInquiry.attachment && (
                <div className="border-t pt-4">
                  <label className="text-xs text-gray-500 uppercase font-bold">Attachment</label>
                  <button
                    onClick={() => handleFileClick(selectedInquiry.attachment)}
                    className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
                  >
                    <Paperclip size={14} />
                    파일 보기
                  </button>
                </div>
              )}
            </div>
            
            {/* 푸터 */}
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 로딩 오버레이 */}
      {loadingDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-bold">복호화 중...</span>
          </div>
        </div>
      )}
    </div>
  );
};
