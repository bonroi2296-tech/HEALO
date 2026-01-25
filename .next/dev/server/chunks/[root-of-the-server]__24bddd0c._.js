module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

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
"[project]/src/lib/rag/buildDocument.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildDocument",
    ()=>buildDocument
]);
const joinLines = (lines)=>lines.filter(Boolean).join("\n").trim();
const buildDocument = (sourceType, row)=>{
    switch(sourceType){
        case "treatment":
            {
                // Fields used:
                // id, slug, name, description, full_description, tags, benefits,
                // price_min, price_max, hospitals.name, hospitals.location_en/location_kr
                const title = row?.name || null;
                const content = joinLines([
                    `Treatment: ${row?.name || ""}`,
                    row?.slug ? `Slug: ${row.slug}` : null,
                    row?.description ? `Summary: ${row.description}` : null,
                    row?.full_description ? `Details: ${row.full_description}` : null,
                    row?.tags?.length ? `Tags: ${row.tags.join(", ")}` : null,
                    row?.benefits?.length ? `Benefits: ${row.benefits.join(", ")}` : null,
                    row?.price_min != null ? `Price Min: ${row.price_min}` : null,
                    row?.price_max != null ? `Price Max: ${row.price_max}` : null,
                    row?.hospitals?.name ? `Hospital: ${row.hospitals.name}` : null,
                    row?.hospitals?.location_en ? `Hospital Location (EN): ${row.hospitals.location_en}` : null,
                    row?.hospitals?.location_kr ? `Hospital Location (KR): ${row.hospitals.location_kr}` : null
                ]);
                return {
                    source_type: sourceType,
                    source_id: row.id,
                    lang: "en",
                    title,
                    content
                };
            }
        case "hospital":
            {
                // Fields used:
                // id, slug, name, description, location_en, location_kr, address_detail,
                // tags, operating_hours, doctor_profile
                const title = row?.name || null;
                const content = joinLines([
                    `Hospital: ${row?.name || ""}`,
                    row?.slug ? `Slug: ${row.slug}` : null,
                    row?.description ? `Summary: ${row.description}` : null,
                    row?.location_en ? `Location (EN): ${row.location_en}` : null,
                    row?.location_kr ? `Location (KR): ${row.location_kr}` : null,
                    row?.address_detail ? `Address Detail: ${row.address_detail}` : null,
                    row?.tags?.length ? `Tags: ${row.tags.join(", ")}` : null,
                    row?.operating_hours ? `Operating Hours: ${JSON.stringify(row.operating_hours)}` : null,
                    row?.doctor_profile ? `Doctor Profile: ${row.doctor_profile}` : null
                ]);
                return {
                    source_type: sourceType,
                    source_id: row.id,
                    lang: "en",
                    title,
                    content
                };
            }
        case "review":
            {
                // Fields used:
                // id, treatment_id, user_name, country, rating, content, created_at
                const title = row?.user_name ? `Review by ${row.user_name}` : "Review";
                const content = joinLines([
                    row?.treatment_id ? `Treatment ID: ${row.treatment_id}` : null,
                    row?.user_name ? `User: ${row.user_name}` : null,
                    row?.country ? `Country: ${row.country}` : null,
                    row?.rating != null ? `Rating: ${row.rating}` : null,
                    row?.created_at ? `Created: ${row.created_at}` : null,
                    row?.content ? `Review: ${row.content}` : null
                ]);
                return {
                    source_type: sourceType,
                    source_id: row.id,
                    lang: "en",
                    title,
                    content
                };
            }
        case "normalized_inquiry":
            {
                // Fields used:
                // id, language, country, treatment_id, treatment_slug, objective,
                // constraints, raw_message, extraction_confidence, missing_fields, contact
                const title = row?.objective || (row?.treatment_slug ? `Inquiry about ${row.treatment_slug}` : null) || "Inquiry";
                const content = joinLines([
                    row?.language ? `Language: ${row.language}` : null,
                    row?.country ? `Country: ${row.country}` : null,
                    row?.treatment_id ? `Treatment ID: ${row.treatment_id}` : null,
                    row?.treatment_slug ? `Treatment Slug: ${row.treatment_slug}` : null,
                    row?.objective ? `Objective: ${row.objective}` : null,
                    row?.constraints ? `Constraints: ${JSON.stringify(row.constraints)}` : null,
                    row?.raw_message ? `Raw Message: ${row.raw_message}` : null,
                    row?.extraction_confidence != null ? `Extraction Confidence: ${row.extraction_confidence}` : null,
                    row?.missing_fields?.length ? `Missing Fields: ${row.missing_fields.join(", ")}` : null,
                    row?.contact ? `Contact: ${JSON.stringify(row.contact)}` : null
                ]);
                return {
                    source_type: sourceType,
                    source_id: row.id,
                    lang: row?.language || "en",
                    title,
                    content
                };
            }
        default:
            {
                const content = joinLines([
                    row?.content || ""
                ]);
                return {
                    source_type: sourceType,
                    source_id: row.id,
                    lang: row?.lang || "en",
                    title: row?.title || null,
                    content
                };
            }
    }
};
}),
"[project]/src/lib/rag/chunker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chunkText",
    ()=>chunkText
]);
const splitSentences = (text)=>{
    return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
};
const chunkText = (text, maxLength = 800)=>{
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    const sentences = splitSentences(normalized);
    const chunks = [];
    let current = "";
    let index = 0;
    const pushChunk = (value)=>{
        const trimmed = value.trim();
        if (!trimmed) return;
        chunks.push({
            index,
            content: trimmed
        });
        index += 1;
    };
    for (const sentence of sentences){
        if (!sentence) continue;
        if (sentence.length > maxLength) {
            if (current) {
                pushChunk(current);
                current = "";
            }
            for(let i = 0; i < sentence.length; i += maxLength){
                pushChunk(sentence.slice(i, i + maxLength));
            }
            continue;
        }
        if ((current + " " + sentence).trim().length > maxLength) {
            pushChunk(current);
            current = sentence;
        } else {
            current = current ? `${current} ${sentence}` : sentence;
        }
    }
    if (current) pushChunk(current);
    return chunks;
};
}),
"[project]/src/lib/rag/ingest.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ingestSources",
    ()=>ingestSources
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/supabaseAdmin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$buildDocument$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/buildDocument.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$chunker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/chunker.ts [app-route] (ecmascript)");
;
;
;
const nowIso = ()=>new Date().toISOString();
const fetchSourceRows = async (sourceType, sourceId)=>{
    switch(sourceType){
        case "treatment":
            {
                let q = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("treatments").select("id, slug, name, description, full_description, tags, benefits, price_min, price_max, hospitals(name, location_en, location_kr)");
                if (sourceId) q = q.eq("id", sourceId);
                return q;
            }
        case "hospital":
            {
                let q = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("hospitals").select("id, slug, name, description, location_en, location_kr, address_detail, tags, operating_hours, doctor_profile");
                if (sourceId) q = q.eq("id", sourceId);
                return q;
            }
        case "review":
            {
                let q = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("reviews").select("id, treatment_id, user_name, country, rating, content, created_at");
                if (sourceId) q = q.eq("id", sourceId);
                return q;
            }
        case "normalized_inquiry":
            {
                let q = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("normalized_inquiries").select("id, language, country, treatment_id, treatment_slug, objective, constraints, raw_message, extraction_confidence, missing_fields, contact");
                if (sourceId) q = q.eq("id", sourceId);
                return q;
            }
        default:
            return {
                data: [],
                error: null
            };
    }
};
const upsertDocumentAndChunks = async (doc)=>{
    const { data: existing, error: existingError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("rag_documents").select("id, content, version").eq("source_type", doc.source_type).eq("source_id", doc.source_id).eq("lang", doc.lang).maybeSingle();
    if (existingError) throw existingError;
    const needsUpdate = !existing || existing.content !== doc.content;
    let documentId = existing?.id;
    let version = existing?.version ?? 1;
    if (!existing) {
        const { data: inserted, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("rag_documents").insert({
            source_type: doc.source_type,
            source_id: doc.source_id,
            lang: doc.lang,
            title: doc.title,
            content: doc.content,
            version: 1,
            created_at: nowIso(),
            updated_at: nowIso()
        }).select("id, version").single();
        if (error) throw error;
        documentId = inserted.id;
        version = inserted.version;
    } else if (needsUpdate) {
        const { data: updated, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("rag_documents").update({
            title: doc.title,
            content: doc.content,
            version: version + 1,
            updated_at: nowIso()
        }).eq("id", existing.id).select("id, version").single();
        if (error) throw error;
        documentId = updated.id;
        version = updated.version;
    }
    if (!documentId) return {
        updated: false,
        documentId: null
    };
    if (needsUpdate) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("rag_chunks").delete().eq("document_id", documentId);
        const chunks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$chunker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["chunkText"])(doc.content);
        if (chunks.length > 0) {
            const payload = chunks.map((chunk)=>({
                    document_id: documentId,
                    chunk_index: chunk.index,
                    content: chunk.content,
                    metadata: {
                        source_type: doc.source_type,
                        source_id: doc.source_id,
                        lang: doc.lang,
                        title: doc.title,
                        version
                    }
                }));
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("rag_chunks").insert(payload);
            if (error) throw error;
        }
    }
    return {
        updated: needsUpdate,
        documentId
    };
};
const ingestSources = async (sourceTypes = [
    "treatment",
    "hospital",
    "review",
    "normalized_inquiry"
], sourceId)=>{
    const results = {};
    for (const sourceType of sourceTypes){
        const { data, error } = await fetchSourceRows(sourceType, sourceId);
        if (error) throw error;
        let updatedCount = 0;
        for (const row of data || []){
            const doc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$buildDocument$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildDocument"])(sourceType, row);
            if (!doc.content) continue;
            const result = await upsertDocumentAndChunks(doc);
            if (result.updated) updatedCount += 1;
        }
        results[sourceType] = updatedCount;
    }
    return results;
};
}),
"[project]/app/api/rag/ingest/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rag/ingest.ts [app-route] (ecmascript)");
;
async function POST(request) {
    try {
        const body = await request.json().catch(()=>({}));
        const sourceTypes = Array.isArray(body?.sourceTypes) ? body.sourceTypes : undefined;
        const sourceId = body?.source_id ? String(body.source_id) : undefined;
        const results = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rag$2f$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestSources"])(sourceTypes, sourceId);
        return Response.json({
            ok: true,
            results
        });
    } catch (error) {
        return Response.json({
            ok: false,
            error: error?.message || "ingest_failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__24bddd0c._.js.map