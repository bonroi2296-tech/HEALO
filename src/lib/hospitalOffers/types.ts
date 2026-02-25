/**
 * HOSPITAL_OFFER_IMPORT_V1: 미리보기/Apply 페이로드 타입
 * - 출처 없는 값은 null. "verified" 문구 금지.
 */

export interface OfferSource {
  url: string;
  type: "html" | "pdf" | "image";
  title?: string;
}

export interface TreatmentOffer {
  name: string;
  slug?: string | null;
  description?: string | null;
  full_description?: string | null;
  duration?: number | null; // 분
  anesthesia_type?: string | null;
  recovery_time_min?: number | null;
  recovery_time_max?: number | null;
  side_effects?: string[];
  precautions?: string[];
  price_min?: number | null;
  price_max?: number | null;
  currency?: string | null;
  price_includes?: string[];
  tags?: string[];
  images?: string[];
}

export interface FieldEvidence {
  source_url: string;
  snippet_or_ocr_text: string;
}

export interface OfferEvidence {
  [field: string]: FieldEvidence | undefined;
}

export interface OfferItem {
  treatment: TreatmentOffer;
  evidence: OfferEvidence;
  confidence: number; // 0~1
}

export interface OffersPreviewPayload {
  hospital_id: string;
  captured_at: string; // ISO
  sources: OfferSource[];
  offers: OfferItem[]; // 최대 3
}
