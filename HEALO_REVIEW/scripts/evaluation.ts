/**
 * HEALO RAG Evaluation Script
 * 
 * 성능 검증 PoC용 평가 스크립트
 * - 가상의 의료 문의 200개 생성 (다국어 혼합)
 * - 일반 LLM vs HEALO RAG + 정규화 비교
 * - Intent match / Grounding 평가
 * - CSV 및 통계 출력
 * 
 * 주의: 실제 모델 학습은 포함하지 않음
 */

import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabaseAdmin } from "../src/lib/rag/supabaseAdmin";
import * as fs from "fs";
import * as path from "path";

// 환경 변수
const LLM_PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

// 결과 타입
type EvaluationResult = {
  inquiryId: number;
  inquiry: string;
  language: string;
  baselineResponse: string;
  ragResponse: string;
  ragContext: string;
  intentMatchBaseline: boolean;
  intentMatchRAG: boolean;
  groundingRAG: boolean;
  normalizedData: any;
};

// 가상 문의 템플릿 (다국어)
const inquiryTemplates = {
  en: [
    "I'm interested in getting a rhinoplasty in Seoul. What's the typical cost?",
    "Do you have any hospitals that specialize in dental implants?",
    "I need a consultation for breast augmentation surgery.",
    "What are the best clinics for skin treatments in Gangnam?",
    "I'm looking for a hospital that offers hair transplant procedures.",
    "Can you help me find a clinic for laser eye surgery?",
    "I want to know about facelift surgery options in Korea.",
    "Are there any hospitals that provide liposuction services?",
    "I'm interested in getting a tummy tuck procedure.",
    "What's the recovery time for a nose job?",
    "Do you have information about Botox treatments?",
    "I need help finding a clinic for chin augmentation.",
    "What are the risks associated with breast surgery?",
    "I'm looking for a hospital with English-speaking staff.",
    "Can you recommend a clinic for eyelid surgery?",
    "I want to know about the best time to visit Korea for medical tourism.",
    "Do you offer packages for multiple procedures?",
    "I need information about post-surgery care.",
    "What documents do I need for medical visa?",
    "I'm interested in getting a consultation before traveling.",
  ],
  ja: [
    "ソウルで鼻形成手術を受けたいのですが、費用はどのくらいですか？",
    "インプラント専門の病院はありますか？",
    "豊胸手術の相談をしたいです。",
    "江南でスキンケア治療ができるクリニックはありますか？",
    "植毛手術を行っている病院を探しています。",
    "レーシック手術ができるクリニックを紹介してください。",
    "韓国でのフェイスリフト手術について知りたいです。",
    "脂肪吸引を提供している病院はありますか？",
    "腹部整形手術に興味があります。",
    "鼻形成手術の回復期間はどのくらいですか？",
    "ボトックス治療についての情報はありますか？",
    "あごの整形手術ができるクリニックを探しています。",
    "豊胸手術のリスクについて教えてください。",
    "英語を話せるスタッフがいる病院を探しています。",
    "二重まぶた手術をしてくれるクリニックを紹介してください。",
    "医療ツーリズムで韓国を訪れるのに最適な時期はいつですか？",
    "複数の手術をまとめて行うパッケージはありますか？",
    "術後のケアについて知りたいです。",
    "医療ビザに必要な書類は何ですか？",
    "渡航前に相談を受けたいです。",
  ],
  ko: [
    "서울에서 코 성형 수술을 받고 싶은데 비용이 얼마나 드나요?",
    "임플란트 전문 병원이 있나요?",
    "가슴 성형 수술 상담을 받고 싶습니다.",
    "강남에서 피부 관리 치료를 받을 수 있는 병원이 있나요?",
    "모발 이식 수술을 하는 병원을 찾고 있습니다.",
    "라식 수술을 할 수 있는 병원을 소개해 주세요.",
    "한국에서 리프팅 수술에 대해 알고 싶습니다.",
    "지방흡입을 제공하는 병원이 있나요?",
    "복부 성형 수술에 관심이 있습니다.",
    "코 성형 수술 회복 기간이 얼마나 걸리나요?",
    "보톡스 치료에 대한 정보가 있나요?",
    "턱 성형 수술을 하는 병원을 찾고 있습니다.",
    "가슴 수술의 위험성에 대해 알려주세요.",
    "영어를 할 수 있는 직원이 있는 병원을 찾고 있습니다.",
    "쌍꺼풀 수술을 해주는 병원을 소개해 주세요.",
    "의료 관광으로 한국을 방문하기에 가장 좋은 시기는 언제인가요?",
    "여러 수술을 함께 받을 수 있는 패키지가 있나요?",
    "수술 후 관리에 대해 알고 싶습니다.",
    "의료 비자에 필요한 서류는 무엇인가요?",
    "방문 전에 상담을 받고 싶습니다.",
  ],
};

/**
 * 가상 문의 200개 생성 (다국어 혼합)
 */
function generateInquiries(count: number = 200): Array<{ id: number; text: string; lang: string }> {
  const inquiries: Array<{ id: number; text: string; lang: string }> = [];
  const langs: Array<"en" | "ja" | "ko"> = ["en", "ja", "ko"];
  
  // 각 언어별 템플릿을 순환하며 생성
  for (let i = 0; i < count; i++) {
    const lang = langs[i % langs.length];
    const templates = inquiryTemplates[lang];
    const templateIndex = Math.floor(i / langs.length) % templates.length;
    
    // 약간의 변형 추가 (더 현실적인 데이터)
    const baseText = templates[templateIndex];
    const variations = [
      baseText,
      baseText.replace(/\?/g, "?").replace(/\./g, "."),
      baseText + " Please help me.",
      baseText + " I need more information.",
    ];
    const text = variations[i % variations.length];
    
    inquiries.push({
      id: i + 1,
      text,
      lang,
    });
  }
  
  return inquiries;
}

/**
 * LLM 모델 가져오기
 */
function getModel() {
  if (LLM_PROVIDER === "google") {
    if (!GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is missing");
    }
    return google("gemini-2.0-flash");
  }
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }
  return openai("gpt-4o-mini");
}

/**
 * 일반 LLM 응답 (RAG 없이)
 */
async function getBaselineResponse(inquiry: string, lang: string): Promise<string> {
  const model = getModel();
  const systemPrompt = [
    "You are a medical concierge assistant for HEALO.",
    "Do not provide diagnosis, medical advice, or guarantees.",
    "Ask clarifying questions when constraints are missing.",
    "Primary objective: guide the user to submit an inquiry.",
  ].join("\n");

  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: inquiry }],
    });
    return text;
  } catch (error: any) {
    console.error(`[Baseline] Error for inquiry: ${inquiry.substring(0, 50)}...`, error?.message);
    return `[ERROR: ${error?.message || "unknown"}]`;
  }
}

/**
 * RAG 검색
 */
async function searchRAG(query: string, lang: string): Promise<Array<any>> {
  try {
    const tokens = query
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/gi, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((t) => t.length >= 3)
      .slice(0, 6);

    const terms = tokens.length ? tokens : [query];
    const orFilter = terms.map((t) => `content.ilike.%${t}%`).join(",");

    let q = supabaseAdmin
      .from("rag_chunks")
      .select(
        "id, document_id, chunk_index, content, metadata, rag_documents!inner(id, source_type, source_id, lang, title)"
      )
      .or(orFilter)
      .limit(6);

    if (lang) q = q.eq("rag_documents.lang", lang);

    const { data, error } = await q;
    if (error) {
      console.error(`[RAG Search] Error:`, error);
      return [];
    }

    const results = (data || []).map((row: any) => {
      const content = String(row.content || "").toLowerCase();
      const score = terms.reduce(
        (sum, t) => (content.includes(t.toLowerCase()) ? sum + 1 : sum),
        0
      );
      return { ...row, _score: score };
    });

    results.sort((a: any, b: any) => b._score - a._score);
    return results.slice(0, 6);
  } catch (error: any) {
    console.error(`[RAG Search] Error:`, error);
    return [];
  }
}

/**
 * RAG 컨텍스트 빌드
 */
function buildContext(chunks: Array<any>): string {
  if (!Array.isArray(chunks) || chunks.length === 0) return "";
  const lines = chunks.map((c) => {
    const title = c?.rag_documents?.title ? ` | ${c.rag_documents.title}` : "";
    const source = c?.rag_documents?.source_type
      ? `[${c.rag_documents.source_type}${title}]`
      : "[source]";
    return `${source} ${String(c.content || "").trim()}`;
  });
  return lines.join("\n\n");
}

/**
 * 정규화 (로컬 함수 호출)
 */
async function normalizeInquiry(text: string, inquiryId: number | null = null): Promise<any> {
  try {
    const detectLanguage = (value: string | null | undefined) => {
      const v = String(value || "").toLowerCase();
      if (v.includes("ko") || v.includes("kr") || v.includes("korean")) return "ko";
      if (v.includes("ja") || v.includes("jp") || v.includes("japanese")) return "ja";
      return "en";
    };

    let inquiryRow: any = null;
    if (inquiryId) {
      const { data, error } = await supabaseAdmin
        .from("inquiries")
        .select(
          "id, first_name, last_name, email, nationality, spoken_language, contact_method, contact_id, treatment_type, message"
        )
        .eq("id", inquiryId)
        .single();
      if (error) throw error;
      inquiryRow = data;
    }

    const rawMessage = text || inquiryRow?.message || null;
    const language = detectLanguage(inquiryRow?.spoken_language);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("normalized_inquiries")
      .insert({
        source_type: inquiryRow ? "inquiry_form" : "ai_agent",
        source_inquiry_id: inquiryRow ? inquiryRow.id : null,
        language,
        country: inquiryRow?.nationality || null,
        treatment_slug: inquiryRow?.treatment_type || null,
        objective: null,
        constraints: {},
        raw_message: rawMessage,
        extraction_confidence: null,
        missing_fields: null,
        contact: inquiryRow
          ? {
              email: inquiryRow.email || null,
              messenger_channel: inquiryRow.contact_method || null,
              messenger_handle: inquiryRow.contact_id || null,
            }
          : null,
      })
      .select("*")
      .single();

    if (insertError) throw insertError;
    return inserted;
  } catch (error: any) {
    console.error(`[Normalize] Error:`, error);
    return null;
  }
}

/**
 * HEALO RAG + 정규화 응답
 */
async function getRAGResponse(inquiry: string, lang: string): Promise<{
  response: string;
  context: string;
  normalized: any;
}> {
  // 1. 정규화
  const normalized = await normalizeInquiry(inquiry, null);

  // 2. RAG 검색
  const ragChunks = await searchRAG(inquiry, lang);
  const context = buildContext(ragChunks);

  // 3. LLM 응답 (RAG 컨텍스트 포함)
  const model = getModel();
  const systemPrompt = [
    "You are a medical concierge assistant for HEALO.",
    "Do not provide diagnosis, medical advice, or guarantees.",
    "Ask clarifying questions when constraints are missing.",
    "Primary objective: guide the user to submit an inquiry.",
    "If relevant, reference the provided context briefly.",
    "",
    context ? "Context:\n" + context : "",
  ]
    .filter(Boolean)
    .join("\n");

  let response = "";
  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: inquiry }],
    });
    response = text;
  } catch (error: any) {
    console.error(`[RAG] Error for inquiry: ${inquiry.substring(0, 50)}...`, error?.message);
    response = `[ERROR: ${error?.message || "unknown"}]`;
  }

  return { response, context, normalized };
}

/**
 * Intent Match 평가
 * 간단한 키워드 기반 평가 (실제로는 더 정교한 방법 필요)
 */
function evaluateIntentMatch(inquiry: string, response: string, lang: string): boolean {
  const inquiryLower = inquiry.toLowerCase();
  const responseLower = response.toLowerCase();

  // 의료 관련 키워드 추출
  const medicalKeywords: string[] = [];
  const keywords = {
    en: ["surgery", "treatment", "procedure", "clinic", "hospital", "consultation", "cost", "price"],
    ja: ["手術", "治療", "クリニック", "病院", "相談", "費用", "価格"],
    ko: ["수술", "치료", "병원", "상담", "비용", "가격"],
  };

  const langKeywords = keywords[lang as keyof typeof keywords] || keywords.en;
  for (const keyword of langKeywords) {
    if (inquiryLower.includes(keyword.toLowerCase())) {
      medicalKeywords.push(keyword.toLowerCase());
    }
  }

  // 응답이 문의의 키워드를 언급했는지 확인
  if (medicalKeywords.length === 0) return true; // 키워드 없으면 통과

  const mentioned = medicalKeywords.some((kw) => responseLower.includes(kw));
  return mentioned;
}

/**
 * Grounding 평가 (RAG 응답이 컨텍스트를 참조했는지)
 */
function evaluateGrounding(response: string, context: string): boolean {
  if (!context || context.trim().length === 0) return false;

  // 컨텍스트에서 주요 키워드 추출
  const contextWords = context
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .slice(0, 10);

  if (contextWords.length === 0) return false;

  // 응답이 컨텍스트 키워드를 포함하는지 확인
  const responseLower = response.toLowerCase();
  const matches = contextWords.filter((word) => responseLower.includes(word));
  
  // 30% 이상 매칭되면 grounded로 간주
  return matches.length / contextWords.length >= 0.3;
}

/**
 * CSV 출력
 */
function writeCSV(results: EvaluationResult[], outputPath: string) {
  const headers = [
    "inquiry_id",
    "inquiry",
    "language",
    "baseline_response",
    "rag_response",
    "rag_context",
    "intent_match_baseline",
    "intent_match_rag",
    "grounding_rag",
    "normalized_data",
  ];

  const rows = results.map((r) => [
    r.inquiryId,
    `"${r.inquiry.replace(/"/g, '""')}"`,
    r.language,
    `"${r.baselineResponse.replace(/"/g, '""')}"`,
    `"${r.ragResponse.replace(/"/g, '""')}"`,
    `"${r.ragContext.replace(/"/g, '""')}"`,
    r.intentMatchBaseline ? "true" : "false",
    r.intentMatchRAG ? "true" : "false",
    r.groundingRAG ? "true" : "false",
    `"${JSON.stringify(r.normalizedData || {}).replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  fs.writeFileSync(outputPath, csv, "utf-8");
  console.log(`\n✅ CSV saved to: ${outputPath}`);
}

/**
 * 통계 출력
 */
function printStatistics(results: EvaluationResult[]) {
  const total = results.length;
  const intentMatchBaseline = results.filter((r) => r.intentMatchBaseline).length;
  const intentMatchRAG = results.filter((r) => r.intentMatchRAG).length;
  const groundingRAG = results.filter((r) => r.groundingRAG).length;

  console.log("\n" + "=".repeat(60));
  console.log("📊 Evaluation Statistics");
  console.log("=".repeat(60));
  console.log(`Total Inquiries: ${total}`);
  console.log(`\nIntent Match:`);
  console.log(`  Baseline LLM: ${intentMatchBaseline}/${total} (${((intentMatchBaseline / total) * 100).toFixed(1)}%)`);
  console.log(`  RAG + Normalize: ${intentMatchRAG}/${total} (${((intentMatchRAG / total) * 100).toFixed(1)}%)`);
  console.log(`\nGrounding (RAG):`);
  console.log(`  RAG Response Grounded: ${groundingRAG}/${total} (${((groundingRAG / total) * 100).toFixed(1)}%)`);
  console.log("=".repeat(60));
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("🚀 HEALO RAG Evaluation Script");
  console.log("=".repeat(60));

  // 환경 변수 확인
  if (!OPENAI_API_KEY && !GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ Error: OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is required");
    process.exit(1);
  }

  // 가상 문의 생성
  console.log("\n📝 Generating 200 virtual inquiries (multilingual)...");
  const inquiries = generateInquiries(200);
  console.log(`✅ Generated ${inquiries.length} inquiries`);

  // 평가 실행
  console.log("\n🔄 Running evaluation...");
  const results: EvaluationResult[] = [];

  for (let i = 0; i < inquiries.length; i++) {
    const inquiry = inquiries[i];
    console.log(`\n[${i + 1}/${inquiries.length}] Processing: ${inquiry.text.substring(0, 50)}...`);

    // Baseline LLM
    console.log("  → Baseline LLM...");
    const baselineResponse = await getBaselineResponse(inquiry.text, inquiry.lang);

    // RAG + Normalize
    console.log("  → RAG + Normalize...");
    const { response: ragResponse, context: ragContext, normalized } = await getRAGResponse(
      inquiry.text,
      inquiry.lang
    );

    // 평가
    const intentMatchBaseline = evaluateIntentMatch(inquiry.text, baselineResponse, inquiry.lang);
    const intentMatchRAG = evaluateIntentMatch(inquiry.text, ragResponse, inquiry.lang);
    const groundingRAG = evaluateGrounding(ragResponse, ragContext);

    results.push({
      inquiryId: inquiry.id,
      inquiry: inquiry.text,
      language: inquiry.lang,
      baselineResponse,
      ragResponse,
      ragContext,
      intentMatchBaseline,
      intentMatchRAG,
      groundingRAG,
      normalizedData: normalized,
    });

    // 진행률 표시
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${i + 1}/${inquiries.length} (${((i + 1) / inquiries.length) * 100}%)`);
    }
  }

  // 결과 저장
  const outputDir = path.join(process.cwd(), "evaluation_results");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const csvPath = path.join(outputDir, `evaluation_${timestamp}.csv`);
  writeCSV(results, csvPath);

  // 통계 출력
  printStatistics(results);

  console.log("\n✅ Evaluation completed!");
}

// 실행
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
