"use client";

import { useState, useEffect } from "react";
import { InquiryManager } from "./_client/InquiryManager";
import { createSupabaseBrowserClient } from "../../../src/lib/supabase/browser";
import { useToast } from "../../../src/components/Toast";
import { X } from "lucide-react";

const supabase = createSupabaseBrowserClient();

export default function InquiriesPage() {
  const toast = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  // 문의 목록 조회 (마스킹됨)
  const fetchInquiries = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        console.warn('[InquiriesPage] No access token');
        return;
      }

      const response = await fetch('/api/admin/inquiries?limit=200&decrypt=false', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (result.ok) {
        setInquiries(result.inquiries || []);
      } else {
        console.error('[InquiriesPage] API failed:', result.error);
        toast.error(`문의 로딩 실패: ${result.error}`);
        setInquiries([]);
      }
    } catch (error) {
      console.error('[InquiriesPage] fetchInquiries error:', error);
      toast.error(`문의 로딩 실패: ${error.message}`);
      setInquiries([]);
    }
  };


  // 첨부파일 미리보기
  const handleFileClick = async (storagePath) => {
    try {
      console.log('[InquiriesPage] Raw attachment path:', storagePath);

      if (!storagePath) {
        toast.error("첨부파일 경로가 없습니다.");
        return;
      }

      let cleanPath = storagePath;
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }

      console.log('[InquiriesPage] Cleaned path:', cleanPath);

      const response = await fetch('/api/attachments/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: cleanPath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signed URL 생성 실패');
      }

      const data = await response.json();
      if (!data.signedUrl) {
        throw new Error('Signed URL이 반환되지 않았습니다.');
      }

      console.log('[InquiriesPage] Signed URL generated successfully');
      setPreviewError(false);
      setSelectedFile(data.signedUrl);
    } catch (err) {
      console.error('[InquiriesPage] handleFileClick exception:', err);
      toast.error("첨부파일 로드 실패: " + (err.message || '알 수 없는 오류'));
    }
  };

  // 파일 타입 확인
  const getFileType = (url) => {
    const lowerUrl = url.toLowerCase().split('?')[0];
    if (lowerUrl.endsWith('.pdf')) return 'pdf';
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    return 'unknown';
  };

  // 첫 로드 시 문의 목록 조회
  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div>
      <InquiryManager
        inquiries={inquiries}
        fetchInquiries={fetchInquiries}
        handleFileClick={handleFileClick}
      />

      {/* 파일 미리보기 모달 */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
          <div className="bg-white rounded-t-2xl lg:rounded-xl shadow-2xl w-full lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-base lg:text-lg">첨부파일 미리보기</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {previewError ? (
                <div className="text-center text-red-500">
                  <p className="mb-4">파일을 불러올 수 없습니다.</p>
                  <a
                    href={selectedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 underline hover:text-teal-700"
                  >
                    새 탭에서 열기
                  </a>
                </div>
              ) : (
                <>
                  {getFileType(selectedFile) === 'pdf' && (
                    <iframe
                      src={selectedFile}
                      className="w-full h-[600px] border"
                      title="PDF Preview"
                      onError={() => setPreviewError(true)}
                    />
                  )}
                  {getFileType(selectedFile) === 'image' && (
                    <img
                      src={selectedFile}
                      alt="Attachment"
                      className="max-w-full max-h-[600px] mx-auto"
                      onError={() => setPreviewError(true)}
                    />
                  )}
                  {getFileType(selectedFile) === 'unknown' && (
                    <div className="text-center">
                      <p className="mb-4">미리보기를 지원하지 않는 파일 형식입니다.</p>
                      <a
                        href={selectedFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                      >
                        다운로드
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
