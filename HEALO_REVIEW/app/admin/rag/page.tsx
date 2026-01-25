"use client";

import { useEffect, useState } from "react";

type InquiryRow = {
  id: number;
  email?: string | null;
  treatment_type?: string | null;
  message?: string | null;
};

export default function RagAdminPage() {
  const [normalizeText, setNormalizeText] = useState("");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>("");
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [normalizeResult, setNormalizeResult] = useState<any>(null);

  const [ingestSourceType, setIngestSourceType] = useState("treatment");
  const [ingestSourceId, setIngestSourceId] = useState("");
  const [ingestResult, setIngestResult] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLang, setSearchLang] = useState("en");
  const [searchResult, setSearchResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/rag/inquiries")
      .then((r) => r.json())
      .then((data) => setInquiries(data?.rows || []))
      .catch(() => setInquiries([]));
  }, []);

  const handleNormalize = async () => {
    setNormalizeResult(null);
    const payload: any = {};
    if (normalizeText.trim()) payload.text = normalizeText.trim();
    if (selectedInquiryId) payload.inquiry_id = Number(selectedInquiryId);
    const res = await fetch("/api/inquiry/normalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setNormalizeResult(data);
  };

  const handleIngest = async () => {
    setIngestResult(null);
    const payload: any = { sourceTypes: [ingestSourceType] };
    if (ingestSourceId.trim()) payload.source_id = ingestSourceId.trim();
    const res = await fetch("/api/rag/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setIngestResult(data);
  };

  const handleSearch = async () => {
    setSearchResult(null);
    const res = await fetch("/api/rag/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery.trim(),
        lang: searchLang,
      }),
    });
    const data = await res.json();
    setSearchResult(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full p-6 flex flex-col z-20">
        <div className="text-2xl font-black text-teal-600 mb-10 flex items-center gap-2">
          관리자 모드
        </div>
        <nav className="space-y-2 flex-1">
          <a
            href="/admin"
            className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition text-gray-500 hover:bg-gray-50"
          >
            시장 분석 (통계)
          </a>
          <a
            href="/admin"
            className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition text-gray-500 hover:bg-gray-50"
          >
            고객 문의
          </a>
          <a
            href="/admin"
            className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition text-gray-500 hover:bg-gray-50"
          >
            병원 관리
          </a>
          <a
            href="/admin"
            className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition text-gray-500 hover:bg-gray-50"
          >
            시술 관리
          </a>
          <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
            <a
              href="/admin"
              className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition text-gray-500 hover:bg-gray-50"
            >
              사이트 설정
            </a>
            <div className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 bg-teal-50 text-teal-700">
              RAG 테스트
            </div>
          </div>
        </nav>
        <a
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold px-2 py-2"
        >
          관리자 나가기
        </a>
      </aside>

      <div className="ml-64 flex-1 p-8 md:p-12 max-w-5xl space-y-10 text-sm text-gray-800">
        <section>
          <h1 className="text-xl font-bold">RAG 테스트</h1>
          <p className="text-gray-500">정규화/수집/검색용 최소 도구</p>
        </section>

        <section className="space-y-3">
        <h2 className="text-lg font-semibold">A) 문의 정규화 테스트</h2>
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          placeholder="문의 내용을 붙여넣기..."
          value={normalizeText}
          onChange={(e) => setNormalizeText(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <select
            className="border rounded p-2"
            value={selectedInquiryId}
            onChange={(e) => setSelectedInquiryId(e.target.value)}
          >
            <option value="">문의 폼 레코드 선택</option>
            {inquiries.map((row) => (
              <option key={row.id} value={row.id}>
                {row.id} {row.email ? `- ${row.email}` : ""}
              </option>
            ))}
          </select>
          <button className="border px-3 py-2" onClick={handleNormalize}>
            정규화 실행
          </button>
        </div>
        <pre className="bg-gray-50 border rounded p-3 overflow-auto">
          {normalizeResult ? JSON.stringify(normalizeResult, null, 2) : "—"}
        </pre>
      </section>

        <section className="space-y-3">
        <h2 className="text-lg font-semibold">B) 수집(ingest) 테스트</h2>
        <div className="flex items-center gap-3">
          <select
            className="border rounded p-2"
            value={ingestSourceType}
            onChange={(e) => setIngestSourceType(e.target.value)}
          >
            <option value="treatment">시술 (treatment)</option>
            <option value="hospital">병원 (hospital)</option>
            <option value="review">리뷰 (review)</option>
            <option value="normalized_inquiry">정규화 문의 (normalized_inquiry)</option>
          </select>
          <input
            className="border rounded p-2 flex-1"
            placeholder="source_id (선택)"
            value={ingestSourceId}
            onChange={(e) => setIngestSourceId(e.target.value)}
          />
          <button className="border px-3 py-2" onClick={handleIngest}>
            수집 실행
          </button>
        </div>
        <pre className="bg-gray-50 border rounded p-3 overflow-auto">
          {ingestResult ? JSON.stringify(ingestResult, null, 2) : "—"}
        </pre>
      </section>

        <section className="space-y-3">
        <h2 className="text-lg font-semibold">C) 검색 테스트</h2>
        <div className="flex items-center gap-3">
          <input
            className="border rounded p-2 flex-1"
            placeholder="검색어..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border rounded p-2"
            value={searchLang}
            onChange={(e) => setSearchLang(e.target.value)}
          >
            <option value="en">en</option>
            <option value="ko">ko</option>
            <option value="ja">ja</option>
          </select>
          <button className="border px-3 py-2" onClick={handleSearch}>
            검색
          </button>
        </div>
        <pre className="bg-gray-50 border rounded p-3 overflow-auto">
          {searchResult ? JSON.stringify(searchResult, null, 2) : "—"}
        </pre>
      </section>
      </div>
    </div>
  );
}
