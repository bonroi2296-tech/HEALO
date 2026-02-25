'use client';

import { useState } from 'react';
import { X, Loader2, ExternalLink, FileText, Save } from 'lucide-react';

/**
 * 미리보기 payload: { hospital_id, captured_at, sources, offers }
 * offers[].treatment: name, slug, description, full_description, duration, anesthesia_type,
 *   recovery_time_min/max, side_effects, precautions, price_min/max/currency, price_includes, tags, images
 * offers[].evidence: { [field]: { source_url, snippet_or_ocr_text } }
 * offers[].confidence: 0~1
 */
function OfferCard({ offer, index }) {
  const [showEvidence, setShowEvidence] = useState(false);
  const t = offer?.treatment || {};
  const ev = offer?.evidence || {};
  const priceStr =
    t.price_min != null || t.price_max != null
      ? [t.price_min, t.price_max].filter((n) => n != null).join(' ~ ') + (t.currency ? ` ${t.currency}` : '')
      : null;
  const durationStr = t.duration != null ? `${t.duration}분` : null;
  const recoveryStr =
    t.recovery_time_min != null || t.recovery_time_max != null
      ? [t.recovery_time_min, t.recovery_time_max].filter((n) => n != null).join('~') + '일'
      : null;

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-gray-900">{t.name || `시술 ${index + 1}`}</h4>
        <span className="text-xs text-gray-500">신뢰도 {(offer.confidence * 100).toFixed(0)}%</span>
      </div>
      <div className="mt-2 space-y-1 text-sm text-gray-600">
        {priceStr && <div>가격: {priceStr}</div>}
        {durationStr && <div>소요: {durationStr}</div>}
        {recoveryStr && <div>회복: {recoveryStr}</div>}
        {t.anesthesia_type && <div>마취: {t.anesthesia_type}</div>}
        {t.price_includes?.length > 0 && (
          <div>포함: {t.price_includes.join(', ')}</div>
        )}
      </div>
      {t.images?.length > 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {t.images.slice(0, 3).map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-16 h-16 rounded overflow-hidden border border-gray-200"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.keys(ev).length > 0 && (
          <button
            type="button"
            onClick={() => setShowEvidence((e) => !e)}
            className="flex items-center gap-1 text-xs text-teal-600 hover:underline"
          >
            <FileText size={12} />
            근거 텍스트 {showEvidence ? '숨기기' : '보기'}
          </button>
        )}
      </div>
      {showEvidence && Object.keys(ev).length > 0 && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(ev).map(([field, v]) => (
            <div key={field}>
              <span className="font-medium text-gray-500">{field}:</span>{' '}
              <a
                href={v?.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline"
              >
                Source
              </a>
              <div className="mt-0.5 text-gray-600">{v?.snippet_or_ocr_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HospitalOffersPreviewModal({
  open,
  onClose,
  payload,
  loading,
  onConfirmSave,
  hospitalId,
  toast,
}) {
  const [saving, setSaving] = useState(false);
  if (!open) return null;

  const sources = payload?.sources || [];
  const offers = payload?.offers || [];

  const handleApply = async () => {
    if (!hospitalId || !payload) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/hospitals/${hospitalId}/offers/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.ok) {
        toast?.success?.(`저장 완료: 생성 ${result.created}건, 수정 ${result.updated}건`);
        onClose();
        onConfirmSave?.();
      } else {
        toast?.error?.(result.detail || result.error || '저장 실패');
      }
    } catch (e) {
      toast?.error?.('저장 요청 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">대표 시술 미리보기 (확정 전)</h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 size={32} className="animate-spin" />
              <span className="ml-2">수집·분석 중...</span>
            </div>
          ) : (
            <>
              {payload?.captured_at && (
                <p className="text-xs text-gray-500 mb-3">
                  수집 시점: {new Date(payload.captured_at).toLocaleString()}
                </p>
              )}
              {sources.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">Source 보기</span>
                  <ul className="mt-1 space-y-1">
                    {sources.map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          {s.title || s.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-4">
                {offers.length === 0 ? (
                  <p className="text-gray-500 text-sm">추출된 시술이 없습니다. (웹사이트 URL·콘텐츠 확인)</p>
                ) : (
                  offers.map((offer, i) => <OfferCard key={i} offer={offer} index={i} />)
                )}
              </div>
            </>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            닫기
          </button>
          {!loading && payload && (
            <button
              type="button"
              onClick={handleApply}
              disabled={saving || offers.length === 0}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? '저장 중...' : '확정 저장'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
