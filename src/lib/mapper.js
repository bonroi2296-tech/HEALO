// src/lib/mapper.js

import { formatPriceRange } from "./i18n/format";

// 1. 이미지 데이터 정규화 (무조건 유효한 URL 배열로 반환)
export const normalizeImages = (raw) => {
  if (!raw) return [];
  
  // 이미 배열이면 유효한 값(URL)만 남김
  if (Array.isArray(raw)) return raw.filter(Boolean);

  // 문자열인 경우 (JSON 스트링이거나 단일 URL 처리)
  if (typeof raw === "string") {
    const t = raw.trim();
    
    // JSON 배열 형태인 경우 ("[...]")
    if (t.startsWith("[") && t.endsWith("]")) {
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {
          console.error("Image parse error:", e);
      }
    }
    
    // 그냥 http로 시작하는 단일 URL인 경우
    if (t.startsWith("http")) return [t];
  }
  
  return [];
};

// 2. 병원 데이터 변환 (DB -> UI 표준)
export const mapHospitalRow = (h) => {
  if (!h) return null; // 🔥 안전장치: 데이터 없으면 터지지 않고 null 반환

  return {
    id: h.id,
    slug: h.slug ?? null,
    name: h.name,
    location: h.location ?? h.location_en ?? h.location_kr ?? '',
    address_detail: h.address_detail ?? '',
    description: h.description,
    tags: Array.isArray(h.tags) ? h.tags : [], // 태그가 배열이 아니면 빈 배열로
    rating: h.rating ?? 0, // 가짜 데이터(4.8) 제거 -> 0으로 초기화
    reviewsCount: h.reviews_count ?? 0, // UI 필드명 명확화
    images: normalizeImages(h.images), // 이미지 정규화 적용
    latitude: h.latitude ?? null,
    longitude: h.longitude ?? null,
    operating_hours: h.operating_hours ?? null,
    doctorProfile: h.doctor_profile || null,
  };
};

// 3. 시술 데이터 변환 (DB -> UI 표준)
export const mapTreatmentRow = (t) => {
  if (!t) return null; // 🔥 안전장치

  return {
    id: t.id,
    slug: t.slug ?? null,
    title: t.name,
    desc: t.description,
    fullDescription: t.full_description,
    hospitalId: t.hospital_id,
    price: formatPriceRange(t.price_min, t.price_max, "en"), // 가격 포맷팅
    tags: Array.isArray(t.tags) ? t.tags : [],
    images: normalizeImages(t.images), // 이미지 정규화 적용
    benefits: Array.isArray(t.benefits) ? t.benefits : [],
    
    // Join된 병원 정보가 있다면 매핑 (없으면 기본값)
    hospitalName: t.hospitals?.name || "Partner Hospital",
    hospitalSlug: t.hospitals?.slug || null,
    hospitalLocation:
      t.hospitals?.location ||
      t.hospitals?.location_en ||
      t.hospitals?.location_kr ||
      "Seoul, Korea",
  };
};