/**
 * HEALO: Admin API 입력 검증 스키마
 * 
 * 목적:
 * - Zod를 사용한 타입 안전 검증
 * - 예상치 못한 필드 거부
 * - 일관된 에러 메시지
 */

import { z } from "zod";

// ==========================================
// Hospital 스키마
// ==========================================

export const HospitalCreateSchema = z.object({
  name: z.string().min(1, "병원명은 필수입니다").max(200, "병원명은 200자 이내여야 합니다"),
  slug: z.string().optional(),
  location_kr: z.string().max(100).optional().nullable(),
  location_en: z.string().max(100).optional().nullable(),
  address_detail: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url("이미지 URL이 유효하지 않습니다")).optional().default([]),
  // New image fields
  thumbnail_image: z.string().url("썸네일 URL이 유효하지 않습니다").optional().nullable(),
  gallery_images: z.array(z.string().url("갤러리 이미지 URL이 유효하지 않습니다")).optional().default([]),
  supported_languages: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  specialties: z.array(z.string()).optional().default([]),
  operating_hours: z.object({
    mon_fri: z.string().optional(),
    sat: z.string().optional(),
  }).optional().nullable(),
  doctor_profile: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    image: z.string().optional(),
    school: z.string().optional(),
    years: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    heroMetric: z.object({
      value: z.string().optional(),
      label: z.string().optional(),
    }).optional(),
  }).optional().nullable(),
  display_order: z.number().int().min(0).optional().nullable(),
  is_published: z.boolean().optional().default(true),
  // Extended metadata fields
  business_registration_number: z.string().optional().nullable(),
  medical_institution_code: z.string().optional().nullable(),
  certifications: z.array(z.object({
    type: z.string(),
    issuer: z.string(),
    date: z.string().optional(),
    valid_until: z.string().optional(),
  })).optional().default([]),
  medical_equipment: z.array(z.string()).optional().default([]),
  insurance_accepted: z.boolean().optional().default(false),
  insurance_details: z.record(z.any()).optional().nullable(),
  annual_surgery_count: z.number().int().min(0).optional().nullable(),
  establishment_date: z.string().optional().nullable(),
  total_staff_count: z.number().int().min(0).optional().nullable(),
  doctor_count: z.number().int().min(0).optional().nullable(),
  external_ratings: z.object({
    naver: z.object({
      rating: z.number().min(0).max(5).optional(),
      count: z.number().int().min(0).optional(),
    }).optional(),
    kakao: z.object({
      rating: z.number().min(0).max(5).optional(),
      count: z.number().int().min(0).optional(),
    }).optional(),
  }).optional().nullable(),
});

export const HospitalUpdateSchema = HospitalCreateSchema.partial();

export type HospitalCreateInput = z.infer<typeof HospitalCreateSchema>;
export type HospitalUpdateInput = z.infer<typeof HospitalUpdateSchema>;

// ==========================================
// Treatment 스키마
// ==========================================

// Base schema without refinements
const TreatmentBaseSchema = z.object({
  hospital_id: z.string().uuid("유효하지 않은 병원 ID입니다"),
  name: z.string().min(1, "시술명은 필수입니다").max(200, "시술명은 200자 이내여야 합니다"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  full_description: z.string().optional().nullable(),
  price_min: z.number().int().min(0, "가격은 0 이상이어야 합니다").optional().default(0),
  price_max: z.number().int().min(0, "가격은 0 이상이어야 합니다").optional().nullable(),
  benefits: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url("이미지 URL이 유효하지 않습니다")).optional().default([]),
  // New image fields
  thumbnail_image: z.string().url("썸네일 URL이 유효하지 않습니다").optional().nullable(),
  gallery_images: z.array(z.string().url("갤러리 이미지 URL이 유효하지 않습니다")).optional().default([]),
  display_order: z.number().int().min(0).optional().nullable(),
  is_published: z.boolean().optional().default(true),
  // Extended metadata fields
  recovery_time_min: z.number().int().min(0).optional().nullable(),
  recovery_time_max: z.number().int().min(0).optional().nullable(),
  recovery_process: z.record(z.string()).optional().nullable(),
  side_effects: z.array(z.string()).optional().default([]),
  side_effects_detail: z.string().optional().nullable(),
  precautions: z.array(z.string()).optional().default([]),
  anesthesia_type: z.string().optional().nullable(),
  surgery_duration_min: z.number().int().min(0).optional().nullable(),
  surgery_duration_max: z.number().int().min(0).optional().nullable(),
  required_equipment: z.array(z.string()).optional().default([]),
  insurance_coverage: z.boolean().optional().default(false),
  insurance_coverage_detail: z.string().optional().nullable(),
  annual_procedure_count: z.number().int().min(0).optional().nullable(),
  success_rate: z.number().min(0).max(100).optional().nullable(),
  similar_treatments: z.array(z.string().uuid()).optional().default([]),
  comparison_data: z.record(z.any()).optional().nullable(),
});

// Create schema with refinements
export const TreatmentCreateSchema = TreatmentBaseSchema.refine(
  (data) => {
    if (data.price_min !== undefined && data.price_max !== undefined && 
        data.price_max !== null && data.price_min > data.price_max) {
      return false;
    }
    return true;
  },
  {
    message: "price_min은 price_max보다 작거나 같아야 합니다",
    path: ["price_max"],
  }
).refine(
  (data) => {
    if (data.recovery_time_min !== undefined && data.recovery_time_max !== undefined &&
        data.recovery_time_min !== null && data.recovery_time_max !== null &&
        data.recovery_time_min > data.recovery_time_max) {
      return false;
    }
    return true;
  },
  {
    message: "recovery_time_min은 recovery_time_max보다 작거나 같아야 합니다",
    path: ["recovery_time_max"],
  }
).refine(
  (data) => {
    if (data.surgery_duration_min !== undefined && data.surgery_duration_max !== undefined &&
        data.surgery_duration_min !== null && data.surgery_duration_max !== null &&
        data.surgery_duration_min > data.surgery_duration_max) {
      return false;
    }
    return true;
  },
  {
    message: "surgery_duration_min은 surgery_duration_max보다 작거나 같아야 합니다",
    path: ["surgery_duration_max"],
  }
);

export const TreatmentUpdateSchema = TreatmentBaseSchema.partial().omit({ hospital_id: true }).extend({
  hospital_id: z.string().uuid().optional(),
});

export type TreatmentCreateInput = z.infer<typeof TreatmentCreateSchema>;
export type TreatmentUpdateInput = z.infer<typeof TreatmentUpdateSchema>;

// ==========================================
// Hospital Leads 스키마
// ==========================================

export const LeadAssignSchema = z.object({
  normalized_inquiry_id: z.string().uuid("유효하지 않은 inquiry ID입니다"),
  hospital_ids: z.array(z.string().uuid("유효하지 않은 hospital ID입니다")).min(1, "최소 1개의 병원을 선택해야 합니다"),
});

export const LeadUpdateSchema = z.object({
  status: z.enum(["queued", "sent", "viewed", "replied", "converted", "rejected", "expired"]).optional(),
  quoted_price_min: z.number().min(0).optional().nullable(),
  quoted_price_max: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.quoted_price_min !== undefined && data.quoted_price_min !== null &&
        data.quoted_price_max !== undefined && data.quoted_price_max !== null) {
      return data.quoted_price_min <= data.quoted_price_max;
    }
    return true;
  },
  {
    message: "quoted_price_min은 quoted_price_max보다 작거나 같아야 합니다",
  }
);

export type LeadAssignInput = z.infer<typeof LeadAssignSchema>;
export type LeadUpdateInput = z.infer<typeof LeadUpdateSchema>;

// ==========================================
// 유틸리티 함수
// ==========================================

/**
 * Zod 에러를 사용자 친화적인 메시지로 변환
 */
export function formatZodError(error: z.ZodError): string {
  const errors = error.errors.map((err) => {
    const field = err.path.join(".");
    return `${field}: ${err.message}`;
  });
  return errors.join(", ");
}

/**
 * 검증 실패 시 일관된 응답 생성
 */
export function validationErrorResponse(error: z.ZodError): Response {
  return Response.json(
    {
      ok: false,
      error: "validation_failed",
      detail: formatZodError(error),
      errors: error.errors,
    },
    { status: 400 }
  );
}
