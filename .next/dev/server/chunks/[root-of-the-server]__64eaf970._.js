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
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/openai/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$google$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/google/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/supabaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/intakeSchema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/intakeExtract.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const isProd = ("TURBOPACK compile-time value", "development") === "production";
const LLM_PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();
const jsonError = (status, code, detail, meta)=>{
    return Response.json({
        ok: false,
        error: code,
        ...("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : {
            detail,
            meta
        }
    }, {
        status
    });
};
const getModel = ()=>{
    if (LLM_PROVIDER === "google") {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error("[api/chat] GOOGLE_GENERATIVE_AI_API_KEY is missing");
            return {
                error: jsonError(500, "google_key_missing", "GOOGLE_GENERATIVE_AI_API_KEY is missing")
            };
        }
        return {
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$google$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["google"])("gemini-2.0-flash")
        };
    }
    if (!process.env.OPENAI_API_KEY) {
        console.error("[api/chat] OPENAI_API_KEY is missing");
        return {
            error: jsonError(500, "openai_key_missing", "OPENAI_API_KEY is missing")
        };
    }
    return {
        model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$openai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["openai"])("gpt-4o-mini")
    };
};
const getModelName = ()=>LLM_PROVIDER === "google" ? "gemini-2.0-flash" : "gpt-4o-mini";
const classifyOpenAiError = (error)=>{
    const message = String(error?.message || "");
    const lower = message.toLowerCase();
    if (lower.includes("insufficient_quota") || lower.includes("quota")) {
        return {
            status: 402,
            code: "openai_quota_exceeded",
            message
        };
    }
    if (lower.includes("invalid_api_key") || lower.includes("api key")) {
        return {
            status: 401,
            code: "openai_invalid_key",
            message
        };
    }
    if (lower.includes("model") && (lower.includes("not found") || lower.includes("does not exist") || lower.includes("access"))) {
        return {
            status: 403,
            code: "openai_model_access",
            message
        };
    }
    if (lower.includes("rate limit")) {
        return {
            status: 429,
            code: "openai_rate_limited",
            message
        };
    }
    return {
        status: 502,
        code: "openai_error",
        message
    };
};
const classifyGoogleError = (error)=>{
    const message = String(error?.message || "");
    const lower = message.toLowerCase();
    if (lower.includes("api key")) {
        return {
            status: 401,
            code: "google_invalid_key",
            message
        };
    }
    if (lower.includes("quota") || lower.includes("insufficient")) {
        return {
            status: 402,
            code: "google_quota_exceeded",
            message
        };
    }
    if (lower.includes("permission") || lower.includes("access")) {
        return {
            status: 403,
            code: "google_access_denied",
            message
        };
    }
    if (lower.includes("rate limit")) {
        return {
            status: 429,
            code: "google_rate_limited",
            message
        };
    }
    return {
        status: 502,
        code: "google_error",
        message
    };
};
const buildContext = (chunks)=>{
    if (!Array.isArray(chunks) || chunks.length === 0) return "";
    const lines = chunks.map((c)=>{
        const title = c?.rag_documents?.title ? ` | ${c.rag_documents.title}` : "";
        const source = c?.rag_documents?.source_type ? `[${c.rag_documents.source_type}${title}]` : "[source]";
        return `${source} ${String(c.content || "").trim()}`;
    });
    return lines.join("\n\n");
};
const getLastUserMessage = (messages = [])=>{
    for(let i = messages.length - 1; i >= 0; i -= 1){
        if (messages[i]?.role === "user") return messages[i];
    }
    return null;
};
function buildIntakeFromQuery(query) {
    const { intake } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createEmptyIntake"])("ai_agent");
    try {
        const q = String(query || "").trim();
        intake.chief_complaint = q ? q.slice(0, 300) : null;
        intake.goal = null;
        intake.body_part = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bodyPartFromText"])(q) ?? null;
        intake.timeline = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractTimelineFromQuery"])(q) ?? null;
        intake.budget = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractBudgetFromQuery"])(q) ?? null;
        intake.duration = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractDurationFromQuery"])(q) ?? null;
        intake.severity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractSeverityFromQuery"])(q) ?? null;
        const { contraindications, allergy, medications } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeExtract$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["contraindicationsAndFlagsFromMessage"])(q);
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
    let body = {};
    try {
        body = await request.json();
    } catch (error) {
        console.error("[api/chat] invalid json:", error);
        return jsonError(400, "invalid_json", error?.message || "invalid_json");
    }
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lang = body?.lang ? String(body.lang) : "en";
    const sessionId = body?.session_id ? String(body.session_id) : null;
    const page = body?.page ? String(body.page) : null;
    const utm = body?.utm && typeof body.utm === "object" ? body.utm : null;
    const lastUser = getLastUserMessage(messages);
    const query = String(lastUser?.content || "").trim();
    if (!query) {
        return jsonError(400, "user_message_required", "last user message is empty");
    }
    // Log normalized inquiry (best effort). constraints.intake + meta 동일 스키마 적재.
    void (async ()=>{
        try {
            let intake = buildIntakeFromQuery(query);
            const meta = {
                pipeline_version: "v1",
                source_type: "ai_agent",
                model: getModelName(),
                prompt_version: null
            };
            const missing_fields = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeMissingFields"])(intake);
            const extraction_confidence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$intakeSchema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeExtractionConfidence"])(intake, missing_fields);
            const constraints = {
                intake,
                meta
            };
            if (sessionId != null) constraints.session_id = sessionId;
            if (page != null) constraints.page = page;
            if (utm != null) constraints.utm = utm;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("normalized_inquiries").insert({
                source_type: "ai_agent",
                language: lang,
                raw_message: query,
                constraints,
                treatment_slug: null,
                objective: null,
                extraction_confidence,
                missing_fields: missing_fields.length ? missing_fields : null
            });
        } catch (error) {
            console.error("[api/chat] normalized_inquiries insert failed:", error);
        }
    })();
    // RAG retrieval (top 6).
    let ragChunks = [];
    try {
        let q = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("rag_chunks").select("id, document_id, chunk_index, content, rag_documents!inner(id, source_type, source_id, lang, title)").ilike("content", `%${query}%`).limit(6);
        if (lang) q = q.eq("rag_documents.lang", lang);
        const { data, error } = await q;
        if (!error) ragChunks = data || [];
        if (error) console.error("[api/chat] rag query error:", error);
    } catch (error) {
        console.error("[api/chat] rag query failed:", error);
    }
    const context = buildContext(ragChunks);
    const systemPrompt = [
        "You are a medical concierge assistant for HEALO.",
        "Do not provide diagnosis, medical advice, or guarantees.",
        "Ask clarifying questions when constraints are missing.",
        "Primary objective: guide the user to submit an inquiry.",
        "If relevant, reference the provided context briefly.",
        "",
        context ? "Context:\n" + context : ""
    ].filter(Boolean).join("\n");
    const modelResult = getModel();
    if (modelResult.error) return modelResult.error;
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["streamText"])({
            model: modelResult.model,
            system: systemPrompt,
            messages: messages,
            onError: ({ error })=>{
                console.error("[api/chat] stream error:", error);
            }
        });
        return result.toDataStreamResponse();
    } catch (error) {
        console.error("[api/chat] LLM error:", error);
        const classified = LLM_PROVIDER === "google" ? classifyGoogleError(error) : classifyOpenAiError(error);
        return jsonError(classified.status, classified.code, classified.message);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__64eaf970._.js.map