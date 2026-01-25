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
"[project]/app/api/inquiries/intake/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
/**
 * HEALO: Step2 intake 저장 API (서버 전용)
 * inquiries.intake에 Step2 데이터 저장 (PII 없음)
 * public_token 검증 후 overwrite (MVP)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/supabaseAdmin.ts [app-route] (ecmascript)");
;
async function POST(request) {
    try {
        const body = await request.json().catch(()=>({}));
        const inquiryId = body?.inquiryId != null ? typeof body.inquiryId === "number" ? body.inquiryId : Number(body.inquiryId) : null;
        const publicToken = body?.publicToken ? String(body.publicToken) : null;
        const intakePatch = body?.intakePatch;
        if (inquiryId == null || isNaN(inquiryId)) {
            return Response.json({
                ok: false,
                error: "inquiry_id_required"
            }, {
                status: 400
            });
        }
        if (!publicToken) {
            return Response.json({
                ok: false,
                error: "public_token_required"
            }, {
                status: 400
            });
        }
        if (!intakePatch || typeof intakePatch !== "object" || Array.isArray(intakePatch)) {
            return Response.json({
                ok: false,
                error: "intake_patch_must_be_object"
            }, {
                status: 400
            });
        }
        const { data: row, error: fetchErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("inquiries").select("id, public_token, intake, attachments").eq("id", inquiryId).maybeSingle();
        if (fetchErr) {
            console.error("[api/inquiries/intake] fetch error:", fetchErr);
            return Response.json({
                ok: false,
                error: "inquiry_fetch_failed"
            }, {
                status: 500
            });
        }
        if (!row) {
            return Response.json({
                ok: false,
                error: "inquiry_not_found"
            }, {
                status: 404
            });
        }
        const stored = row.public_token;
        if (stored == null || String(stored) !== String(publicToken)) {
            console.error("[api/inquiries/intake] public_token mismatch");
            return Response.json({
                ok: false,
                error: "invalid_public_token"
            }, {
                status: 403
            });
        }
        const patch = {
            ...intakePatch
        };
        const extra = Array.isArray(patch.attachments_extra) ? patch.attachments_extra : [];
        delete patch.attachments_extra;
        const existingIntake = row.intake && typeof row.intake === "object" && !Array.isArray(row.intake) ? row.intake : {};
        const mergedIntake = {
            ...existingIntake,
            ...patch
        };
        const existingAttachments = Array.isArray(row.attachments) ? row.attachments : [];
        const mergedAttachments = [
            ...existingAttachments,
            ...extra
        ];
        const updatePayload = {
            intake: mergedIntake
        };
        if (extra.length) updatePayload.attachments = mergedAttachments;
        const { error: updateErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("inquiries").update(updatePayload).eq("id", inquiryId);
        if (updateErr) {
            console.error("[api/inquiries/intake] update error:", updateErr);
            return Response.json({
                ok: false,
                error: "intake_update_failed"
            }, {
                status: 500
            });
        }
        console.log("[api/inquiries/intake] success:", {
            inquiryId
        });
        return Response.json({
            ok: true
        });
    } catch (error) {
        console.error("[api/inquiries/intake] error:", error);
        return Response.json({
            ok: false,
            error: error?.message || "intake_failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4f092701._.js.map