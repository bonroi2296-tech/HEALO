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
    // Log normalized inquiry (best effort).
    void (async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("normalized_inquiries").insert({
                source_type: "ai_agent",
                language: lang,
                raw_message: query,
                constraints: {
                    session_id: sessionId,
                    page,
                    utm
                },
                treatment_slug: null,
                objective: null
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

//# sourceMappingURL=%5Broot-of-the-server%5D__c1c46c3f._.js.map