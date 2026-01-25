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
"[project]/app/api/inquiries/event/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * HEALO: Inquiry Funnel 이벤트 수집 API (서버 전용)
 * step1_viewed, step1_submitted, step2_viewed, step2_submitted
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/supabaseAdmin.ts [app-route] (ecmascript)");
;
const ALLOWED_EVENT_TYPES = [
    "step1_viewed",
    "step1_submitted",
    "step2_viewed",
    "step2_submitted"
];
const REQUIRES_INQUIRY_ID = [
    "step1_submitted",
    "step2_viewed",
    "step2_submitted"
];
async function POST(request) {
    try {
        const body = await request.json().catch(()=>({}));
        const eventType = body?.eventType ? String(body.eventType) : null;
        const inquiryId = body?.inquiryId != null ? typeof body.inquiryId === "number" ? body.inquiryId : Number(body.inquiryId) : null;
        const meta = body?.meta && typeof body.meta === "object" && !Array.isArray(body.meta) ? body.meta : {};
        if (!eventType || !ALLOWED_EVENT_TYPES.includes(eventType)) {
            return Response.json({
                ok: false,
                error: "invalid_event_type",
                allowed: ALLOWED_EVENT_TYPES
            }, {
                status: 400
            });
        }
        if (REQUIRES_INQUIRY_ID.includes(eventType)) {
            if (inquiryId == null || isNaN(inquiryId)) {
                return Response.json({
                    ok: false,
                    error: "inquiry_id_required"
                }, {
                    status: 400
                });
            }
        }
        const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("inquiry_events").insert({
            inquiry_id: inquiryId || null,
            event_type: eventType,
            meta
        });
        if (insertError) {
            console.error("[api/inquiries/event] insert error:", insertError);
            return Response.json({
                ok: false,
                error: "event_insert_failed"
            }, {
                status: 500
            });
        }
        console.log("[api/inquiries/event] success:", {
            eventType,
            inquiryId
        });
        return Response.json({
            ok: true
        });
    } catch (error) {
        console.error("[api/inquiries/event] error:", error);
        return Response.json({
            ok: false,
            error: error?.message || "event_failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__77c905a0._.js.map