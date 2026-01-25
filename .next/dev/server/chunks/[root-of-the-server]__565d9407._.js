module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/lib/rag/supabaseAdmin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://xppnvkuahlrdyfvabzur.supabase.co") || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
    const missing = [];
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(`Supabase admin env missing: ${missing.join(", ")}`);
}
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, serviceKey, {
    auth: {
        persistSession: false
    }
});
}),
"[project]/src/lib/intakeSchema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * IntakeSchema — normalized_inquiries.constraints 고정 스키마
 * AI Agent(/api/chat) + Inquiry Form(/api/inquiry/normalize) 공통 적재용
 */ __turbopack_context__.s([
    "computeExtractionConfidence",
    ()=>computeExtractionConfidence,
    "computeMissingFields",
    ()=>computeMissingFields,
    "createEmptyIntake",
    ()=>createEmptyIntake
]);
/** 필수 6개 — 누락 판단 기준 */ const REQUIRED_KEYS = [
    "goal",
    "chief_complaint",
    "body_part",
    "timeline",
    "budget",
    "attachments_present"
];
function createEmptyIntake(source_type = "ai_agent") {
    const intake = {
        goal: null,
        chief_complaint: null,
        body_part: null,
        duration: null,
        severity: null,
        budget: null,
        timeline: null,
        contraindications: null,
        medical_history_flag: null,
        medications_flag: null,
        allergy_flag: null,
        previous_procedure_flag: null,
        attachments_present: null
    };
    const meta = {
        pipeline_version: "v1",
        source_type,
        model: null,
        prompt_version: null
    };
    return {
        intake,
        meta
    };
}
function computeMissingFields(intake) {
    const missing = [];
    for (const k of REQUIRED_KEYS){
        const v = intake[k];
        if (k === "attachments_present") {
            if (v === null || v === undefined) missing.push(k);
            continue;
        }
        if (v === null || v === undefined || typeof v === "string" && !String(v).trim()) {
            missing.push(k);
        }
    }
    return missing;
}
function computeExtractionConfidence(intake, missing_fields) {
    const filled = REQUIRED_KEYS.length - missing_fields.length;
    if (filled <= 0) return 0;
    return Math.min(1, Math.round(filled / REQUIRED_KEYS.length * 100) / 100);
}
}),
"[project]/src/lib/intakeExtract.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bodyPartFromText",
    ()=>bodyPartFromText,
    "contraindicationsAndFlagsFromMessage",
    ()=>contraindicationsAndFlagsFromMessage,
    "extractBudgetFromQuery",
    ()=>extractBudgetFromQuery,
    "extractDurationFromQuery",
    ()=>extractDurationFromQuery,
    "extractSeverityFromQuery",
    ()=>extractSeverityFromQuery,
    "extractTimelineFromQuery",
    ()=>extractTimelineFromQuery
]);
/**
 * Intake 추출용 키워드/패턴 유틸 (normalize + chat 공용)
 */ const BODY_PART_KEYWORDS = [
    [
        /nose|rhinoplasty|nasal/i,
        "nose"
    ],
    [
        /skin|acne|facial|laser|botox|filler/i,
        "skin"
    ],
    [
        /breast|augmentation|implants/i,
        "breast"
    ],
    [
        /hair|transplant|follicle/i,
        "hair"
    ],
    [
        /eye|lasik|eyelid|double eyelid/i,
        "eye"
    ],
    [
        /abdomen|tummy|liposuction|belly/i,
        "abdomen"
    ],
    [
        /chin|jaw/i,
        "chin"
    ],
    [
        /dental|implant|tooth|teeth/i,
        "dental"
    ]
];
const CONTRAINDICATION_KEYWORDS = [
    [
        /allergy|allergic/i,
        "allergy"
    ],
    [
        /medication|medicine|meds|drug/i,
        "medication"
    ],
    [
        /diabetes|diabetic/i,
        "diabetes"
    ],
    [
        /pregnant|pregnancy/i,
        "pregnant"
    ]
];
function bodyPartFromText(text) {
    const s = String(text || "").toLowerCase();
    if (!s) return null;
    for (const [pattern, part] of BODY_PART_KEYWORDS){
        if (typeof pattern === "string" ? s.includes(pattern) : pattern.test(s)) return part;
    }
    return null;
}
function contraindicationsAndFlagsFromMessage(message) {
    const s = String(message || "").toLowerCase();
    const contraindications = [];
    let allergy = false;
    let medications = false;
    for (const [pattern, label] of CONTRAINDICATION_KEYWORDS){
        const match = typeof pattern === "string" ? s.includes(pattern) : pattern.test(s);
        if (match) {
            contraindications.push(label);
            if (label === "allergy") allergy = true;
            if (label === "medication") medications = true;
        }
    }
    return {
        contraindications,
        allergy,
        medications
    };
}
function extractTimelineFromQuery(q) {
    const s = String(q || "").toLowerCase();
    if (/\basap\b|as soon|urgent/i.test(s)) return "asap";
    if (/1-3\s*month|1\s*to\s*3\s*m|within 3\s*m/i.test(s)) return "1-3m";
    if (/3-6\s*month|3\s*to\s*6\s*m/i.test(s)) return "3-6m";
    if (/6\s*month|6m\+|6m\s*plus/i.test(s)) return "6m+";
    const iso = s.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
    if (iso) return `preferred_date:${iso[0]}`;
    const us = s.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
    if (us) return `preferred_date:${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
    return null;
}
function extractBudgetFromQuery(q) {
    const s = String(q || "").toLowerCase();
    if (/\bbudget\b|price|cost|usd|won|\$|₩|krw/i.test(s)) {
        const m = s.match(/(\d[\d,.]*)\s*(k|m|million|thousand)?\s*(usd|won|krw|\$|₩)?/i);
        if (m) return m[0].trim().slice(0, 50);
        return "mentioned";
    }
    return null;
}
function extractDurationFromQuery(q) {
    const s = String(q || "").toLowerCase();
    if (/\b1w\b|1\s*week/i.test(s)) return "1w";
    if (/\b1m\b|1\s*month/i.test(s)) return "1m";
    if (/\b3m\b|3\s*month/i.test(s)) return "3m";
    if (/\b6m\b|6\s*month/i.test(s)) return "6m";
    if (/\b1y\b|1\s*year|1y\+/i.test(s)) return "1y+";
    return null;
}
function extractSeverityFromQuery(q) {
    const s = String(q || "").toLowerCase();
    if (/\bmild\b|minor|slight/i.test(s)) return "mild";
    if (/\bmedium\b|moderate/i.test(s)) return "medium";
    if (/\bsevere\b|serious|bad/i.test(s)) return "severe";
    const scale = s.match(/\b([0-9]|10)\s*\/\s*10\b|\b([0-9]|10)-10\b/);
    if (scale) return scale[0].slice(0, 20);
    return null;
}
}),
"[project]/src/lib/security/encryption.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertEncryptionKey",
    ()=>assertEncryptionKey,
    "decryptText",
    ()=>decryptText,
    "encryptText",
    ()=>encryptText,
    "hashEmail",
    ()=>hashEmail
]);
/**
 * HEALO: 서버 사이드 암호화 유틸리티
 * pgcrypto 함수를 호출하여 데이터 암호화/복호화
 * 주의: 클라이언트에서는 사용하지 않음
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/supabaseAdmin.ts [app-route] (ecmascript)");
;
const ENCRYPTION_KEY = process.env.SUPABASE_ENCRYPTION_KEY;
const MIN_KEY_LENGTH = 32;
function assertEncryptionKey() {
    if (!ENCRYPTION_KEY) {
        const error = new Error("[security/encryption] SUPABASE_ENCRYPTION_KEY is missing. " + "암호화 키가 설정되지 않았습니다. 환경변수를 확인하세요. " + "키 분실/변경 시 기존 데이터 복호화 불가.");
        console.error(error.message);
        throw error;
    }
    if (ENCRYPTION_KEY.length < MIN_KEY_LENGTH) {
        const error = new Error(`[security/encryption] SUPABASE_ENCRYPTION_KEY is too short (${ENCRYPTION_KEY.length} < ${MIN_KEY_LENGTH}). ` + `암호화 키는 최소 ${MIN_KEY_LENGTH}자 이상이어야 합니다. ` + "키 분실/변경 시 기존 데이터 복호화 불가.");
        console.error(error.message);
        throw error;
    }
}
// 서버 부팅 시 키 검증 (모듈 로드 시점)
// 주의: 개발 환경에서는 경고만, 프로덕션에서는 즉시 실패
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    // 개발 환경에서는 경고만
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < MIN_KEY_LENGTH) {
        console.warn("[security/encryption] WARNING: SUPABASE_ENCRYPTION_KEY is missing or too short. " + "암호화 기능이 정상 작동하지 않을 수 있습니다.");
    }
}
async function encryptText(plaintext) {
    // 키 검증 (암호화 전에 수행)
    assertEncryptionKey();
    if (!plaintext) {
        return null;
    }
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].rpc("encrypt_text", {
            plaintext: String(plaintext),
            encryption_key: ENCRYPTION_KEY
        });
        if (error) {
            console.error("[security/encryption] encrypt error:", error);
            return null;
        }
        return data;
    } catch (error) {
        console.error("[security/encryption] encrypt exception:", error);
        return null;
    }
}
async function decryptText(ciphertext) {
    // 키 검증 (복호화 전에 수행)
    assertEncryptionKey();
    if (!ciphertext) {
        return null;
    }
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].rpc("decrypt_text", {
            ciphertext: String(ciphertext),
            encryption_key: ENCRYPTION_KEY
        });
        if (error) {
            console.error("[security/encryption] decrypt error:", error);
            return null;
        }
        return data;
    } catch (error) {
        console.error("[security/encryption] decrypt exception:", error);
        return null;
    }
}
async function hashEmail(email) {
    if (!email) {
        return null;
    }
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].rpc("email_hash", {
            email: String(email)
        });
        if (error) {
            console.error("[security/encryption] hash error:", error);
            return null;
        }
        return data;
    } catch (error) {
        console.error("[security/encryption] hash exception:", error);
        return null;
    }
}
}),
"[project]/app/api/inquiry/normalize/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/supabaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/intakeSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/intakeExtract.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security/encryption.ts [app-route] (ecmascript)");
;
;
;
;
const detectLanguage = (value)=>{
    const v = String(value || "").toLowerCase();
    if (v.includes("ko") || v.includes("kr") || v.includes("korean")) return "ko";
    if (v.includes("ja") || v.includes("jp") || v.includes("japanese")) return "ja";
    return "en";
};
/** Step2 intake → constraints.intake 표준 구조 (direct mapping) */ function mapIntakeToConstraints(inq) {
    const i = inq?.intake && typeof inq.intake === "object" ? inq.intake : {};
    const c = i?.complaint && typeof i.complaint === "object" ? i.complaint : {};
    const h = i?.history && typeof i.history === "object" ? i.history : {};
    const pref = inq?.preferred_date ? String(inq.preferred_date).slice(0, 10) : null;
    const flex = !!inq?.preferred_date_flex;
    const sev = typeof c.severity === "number" ? c.severity : c.severity != null && c.severity !== "" ? Number(c.severity) : null;
    return {
        complaint: {
            body_part: Array.isArray(c.body_part) ? c.body_part : c.body_part ? [
                c.body_part
            ] : null,
            duration: c.duration && typeof c.duration === "string" ? c.duration : null,
            severity: sev != null && !Number.isNaN(sev) ? sev : null
        },
        history: {
            diagnosis: h.diagnosis && typeof h.diagnosis === "object" ? {
                has: !!h.diagnosis.has,
                text: String(h.diagnosis.text || "")
            } : null,
            meds: h.meds && typeof h.meds === "object" ? {
                has: !!h.meds.has,
                text: String(h.meds.text || "")
            } : null
        },
        logistics: {
            preferred_date: pref,
            flex
        }
    };
}
/** 필수 충족 여부 기반 missing_fields (contact, nationality, spoken_language, treatment, preferred) */ function computeRequiredMissing(row) {
    const missing = [];
    const contactOk = !!row?.email?.trim() || !!(row?.contact_method && row?.contact_id?.trim());
    if (!contactOk) missing.push("contact_reachable");
    if (!row?.nationality?.trim()) missing.push("nationality");
    if (!row?.spoken_language?.trim()) missing.push("spoken_language");
    if (!row?.treatment_type?.trim()) missing.push("treatment_type");
    const preferredOk = !!row?.preferred_date?.trim() || !!row?.preferred_date_flex;
    if (!preferredOk) missing.push("preferred_date_or_flex");
    return missing;
}
function buildIntakeFromForm(row) {
    const { intake } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEmptyIntake"])("inquiry_form");
    try {
        const msg = row?.message ?? null;
        const tt = row?.treatment_type ?? null;
        const pref = row?.preferred_date ?? null;
        const att = row?.attachment ?? null;
        const arr = Array.isArray(row?.attachments) ? row.attachments : [];
        const hasAtt = !!att || arr.length > 0;
        intake.chief_complaint = msg ? String(msg).trim().slice(0, 2000) : null;
        intake.goal = tt ? String(tt) : msg ? String(msg).trim().split(/\n/)[0]?.slice(0, 300) || null : null;
        intake.body_part = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bodyPartFromText"])(tt || msg) ?? null;
        intake.timeline = pref ? `preferred_date:${String(pref).slice(0, 10)}` : null;
        intake.budget = null;
        intake.duration = null;
        intake.severity = null;
        const { contraindications, allergy, medications } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["contraindicationsAndFlagsFromMessage"])(msg);
        intake.contraindications = contraindications.length ? contraindications : null;
        intake.allergy_flag = allergy || null;
        intake.medications_flag = medications || null;
        intake.medical_history_flag = null;
        intake.previous_procedure_flag = null;
        intake.attachments_present = hasAtt;
    } catch  {
    /* no-op: use empty intake */ }
    return intake;
}
function buildIntakeFromTextOnly(text) {
    const { intake } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEmptyIntake"])("ai_agent");
    try {
        const s = String(text || "").trim().slice(0, 300);
        intake.chief_complaint = s || null;
        intake.goal = null;
        intake.body_part = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bodyPartFromText"])(text) ?? null;
        intake.timeline = null;
        intake.budget = null;
        intake.duration = null;
        intake.severity = null;
        const { contraindications, allergy, medications } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["contraindicationsAndFlagsFromMessage"])(text);
        intake.contraindications = contraindications.length ? contraindications : null;
        intake.allergy_flag = allergy || null;
        intake.medications_flag = medications || null;
        intake.medical_history_flag = null;
        intake.previous_procedure_flag = null;
        intake.attachments_present = false;
    } catch  {
    /* no-op */ }
    return intake;
}
async function POST(request) {
    try {
        const body = await request.json().catch(()=>({}));
        const text = body?.text ? String(body.text) : "";
        const inquiryId = body?.inquiry_id != null ? Number(body.inquiry_id) : null;
        const sourceTypePayload = body?.source_type === "inquiry_form" ? "inquiry_form" : null;
        const sourceInquiryIdPayload = body?.source_inquiry_id != null ? Number(body.source_inquiry_id) : null;
        const sessionId = body?.session_id != null ? String(body.session_id) : null;
        const page = body?.page != null ? String(body.page) : null;
        const utm = body?.utm && typeof body.utm === "object" ? body.utm : null;
        const hasInquiryId = inquiryId != null || sourceInquiryIdPayload != null;
        if (!text && !hasInquiryId) {
            return Response.json({
                ok: false,
                error: "text_or_inquiry_id_required"
            }, {
                status: 400
            });
        }
        if (sourceTypePayload === "inquiry_form" && !hasInquiryId) {
            console.warn("[api/inquiry/normalize] inquiry_form requires inquiry_id / source_inquiry_id");
            return Response.json({
                ok: false,
                error: "inquiry_id_required_for_inquiry_form"
            }, {
                status: 400
            });
        }
        const effectiveInquiryId = inquiryId ?? sourceInquiryIdPayload;
        let inquiryRow = null;
        if (effectiveInquiryId) {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("inquiries").select("id, first_name, last_name, email, nationality, spoken_language, contact_method, contact_id, treatment_type, message, preferred_date, preferred_date_flex, attachment, attachments, intake").eq("id", effectiveInquiryId).single();
            if (error) {
                console.error("[api/inquiry/normalize] inquiries fetch error:", error);
                return Response.json({
                    ok: false,
                    error: error?.message || "inquiry_fetch_failed"
                }, {
                    status: 500
                });
            }
            inquiryRow = data;
        }
        const rawMessage = text || inquiryRow?.message || null;
        const language = detectLanguage(inquiryRow?.spoken_language);
        const sourceType = inquiryRow ? "inquiry_form" : "ai_agent";
        const rawIntake = inquiryRow?.intake;
        const hasIntake = rawIntake && typeof rawIntake === "object" && !Array.isArray(rawIntake) && Object.keys(rawIntake).length > 0;
        const stepSource = hasIntake ? "step2" : "step1";
        const constraintsIntake = hasIntake ? mapIntakeToConstraints({
            intake: inquiryRow.intake,
            preferred_date: inquiryRow.preferred_date,
            preferred_date_flex: inquiryRow.preferred_date_flex
        }) : (()=>{
            const legacy = buildIntakeFromForm(inquiryRow || {});
            const pref = legacy.timeline?.startsWith("preferred_date:") ? String(legacy.timeline).replace("preferred_date:", "").slice(0, 10) : inquiryRow?.preferred_date ? String(inquiryRow.preferred_date).slice(0, 10) : null;
            return {
                complaint: {
                    body_part: legacy.body_part ? [
                        legacy.body_part
                    ] : null,
                    duration: legacy.duration ?? null,
                    severity: legacy.severity != null ? Number(legacy.severity) : null
                },
                history: {
                    diagnosis: legacy.medical_history_flag != null ? {
                        has: !!legacy.medical_history_flag,
                        text: ""
                    } : null,
                    meds: legacy.medications_flag != null ? {
                        has: !!legacy.medications_flag,
                        text: ""
                    } : null
                },
                logistics: {
                    preferred_date: pref,
                    flex: !!inquiryRow?.preferred_date_flex
                }
            };
        })();
        const meta = {
            pipeline_version: "v1",
            source_type: sourceType,
            model: null,
            prompt_version: null
        };
        const missing_fields = inquiryRow ? computeRequiredMissing({
            email: inquiryRow.email,
            contact_method: inquiryRow.contact_method,
            contact_id: inquiryRow.contact_id,
            nationality: inquiryRow.nationality,
            spoken_language: inquiryRow.spoken_language,
            treatment_type: inquiryRow.treatment_type,
            preferred_date: inquiryRow.preferred_date,
            preferred_date_flex: inquiryRow.preferred_date_flex
        }) : [];
        const requiredCount = 5;
        const extraction_confidence = missing_fields.length < requiredCount ? Math.min(1, Math.round((1 - missing_fields.length / requiredCount) * 100) / 100) : 0;
        const constraints = {
            intake: constraintsIntake,
            meta: {
                ...meta,
                source: stepSource
            }
        };
        if (sessionId != null) constraints.session_id = sessionId;
        if (page != null) constraints.page = page;
        if (utm != null) constraints.utm = utm;
        // ✅ Security: 민감 데이터 암호화
        const rawMessageEnc = rawMessage ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptText"])(rawMessage) : null;
        const emailEnc = inquiryRow?.email ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptText"])(inquiryRow.email) : null;
        const contactIdEnc = inquiryRow?.contact_id ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptText"])(inquiryRow.contact_id) : null;
        const emailHash = inquiryRow?.email ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashEmail"])(inquiryRow.email) : null;
        // 주의: raw_message는 암호화된 값 저장 (복호화는 서버에서만 가능)
        // contact.email, contact.messenger_handle도 암호화된 값 저장
        const { data: inserted, error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("normalized_inquiries").insert({
            source_type: sourceType,
            source_inquiry_id: inquiryRow ? inquiryRow.id : null,
            language,
            country: inquiryRow?.nationality ?? null,
            treatment_slug: inquiryRow?.treatment_type ?? null,
            objective: null,
            constraints,
            raw_message: rawMessageEnc,
            extraction_confidence,
            missing_fields: missing_fields.length ? missing_fields : null,
            contact: inquiryRow ? {
                email: emailEnc,
                email_hash: emailHash,
                messenger_channel: inquiryRow.contact_method ?? null,
                messenger_handle: contactIdEnc
            } : null
        }).select("*").single();
        if (insertError) {
            console.error("[api/inquiry/normalize] normalized_inquiries insert failed:", insertError);
            return Response.json({
                ok: true,
                normalized: null
            });
        }
        return Response.json({
            ok: true,
            normalized: inserted
        });
    } catch (error) {
        console.error("[api/inquiry/normalize] error:", error);
        return Response.json({
            ok: false,
            error: error?.message || "normalize_failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__565d9407._.js.map