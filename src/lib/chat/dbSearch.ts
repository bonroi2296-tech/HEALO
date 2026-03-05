/**
 * DB 직접 검색 폴백: RAG 결과가 부족할 때 hospitals/treatments 테이블을 복합 검색
 *
 * 검색 전략:
 * 1. 쿼리에서 키워드 추출 (2자 이상)
 * 2. hospitals: name, description, tags, location_kr, location_en 전부 검색
 * 3. treatments: name, description, tags + join된 hospital 정보로 검색
 */

import "server-only";

import { supabaseAdmin } from "../rag/supabaseAdmin";

function extractKeywords(query: string): string[] {
  return query
    .replace(/[?？！!。.，,：:；;~\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((k) => k.length >= 2)
    .slice(0, 5);
}

function buildHospitalFilter(keywords: string[]): string {
  const conditions: string[] = [];
  for (const k of keywords) {
    conditions.push(
      `name.ilike.%${k}%`,
      `description.ilike.%${k}%`,
      `location_kr.ilike.%${k}%`,
      `location_en.ilike.%${k}%`,
    );
  }
  return conditions.join(",");
}

function buildTreatmentFilter(keywords: string[]): string {
  const conditions: string[] = [];
  for (const k of keywords) {
    conditions.push(
      `name.ilike.%${k}%`,
      `description.ilike.%${k}%`,
      `full_description.ilike.%${k}%`,
    );
  }
  return conditions.join(",");
}

function formatHospital(h: any): string {
  const loc = h.location_kr || h.location_en || "";
  const desc = (h.description || "").slice(0, 200);
  const tags = h.tags?.length ? ` | 전문: ${h.tags.slice(0, 5).join(", ")}` : "";
  const rating = h.rating ? ` | 평점: ${h.rating}` : "";
  return `• ${h.name}${loc ? ` (${loc})` : ""}: ${desc}${tags}${rating}`;
}

function formatTreatment(tr: any): string {
  const hospName = tr.hospitals?.name ? ` @ ${tr.hospitals.name}` : "";
  const hospLoc = tr.hospitals?.location_kr ? ` (${tr.hospitals.location_kr})` : "";
  const desc = (tr.description || "").slice(0, 200);
  const price =
    tr.price_min != null
      ? ` | 가격: $${tr.price_min}${tr.price_max ? `–$${tr.price_max}` : "+"}`
      : "";
  const tags = tr.tags?.length ? ` | 태그: ${tr.tags.slice(0, 4).join(", ")}` : "";
  return `• ${tr.name}${hospName}${hospLoc}: ${desc}${price}${tags}`;
}

export interface DbSearchResult {
  context: string;
  hospitalCount: number;
  treatmentCount: number;
  matchedHospitalNames: string[];
}

export async function searchHospitalsAndTreatments(
  query: string
): Promise<DbSearchResult> {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return { context: "", hospitalCount: 0, treatmentCount: 0, matchedHospitalNames: [] };

  let context = "";
  let hospitalCount = 0;
  let treatmentCount = 0;
  let matchedHospitalNames: string[] = [];

  try {
    const hospFilter = buildHospitalFilter(keywords);
    const { data: hospitals } = await supabaseAdmin
      .from("hospitals")
      .select("name, description, tags, location_kr, location_en, rating")
      .or(hospFilter)
      .eq("is_published", true)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(5);

    if (hospitals?.length) {
      hospitalCount = hospitals.length;
      matchedHospitalNames = hospitals.map((h: any) => h.name);
      context +=
        "\n[HEALO 등록 병원]\n" + hospitals.map(formatHospital).join("\n");
      console.log(`[dbSearch] matched hospitals (${hospitalCount}):`, matchedHospitalNames);
    }
  } catch (e) {
    console.error("[dbSearch] hospital search failed:", e);
  }

  try {
    const treatFilter = buildTreatmentFilter(keywords);
    const { data: treatments } = await supabaseAdmin
      .from("treatments")
      .select(
        "name, description, price_min, price_max, tags, hospitals(name, location_kr)"
      )
      .or(treatFilter)
      .eq("is_published", true)
      .limit(5);

    if (treatments?.length) {
      treatmentCount = treatments.length;
      context +=
        "\n[HEALO 등록 시술/프로그램]\n" +
        treatments.map(formatTreatment).join("\n");
    }
  } catch (e) {
    console.error("[dbSearch] treatment search failed:", e);
  }

  return { context, hospitalCount, treatmentCount, matchedHospitalNames };
}
