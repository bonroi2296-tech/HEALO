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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/mapper.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/mapper.js
// 1. 이미지 데이터 정규화 (무조건 유효한 URL 배열로 반환)
__turbopack_context__.s([
    "mapHospitalRow",
    ()=>mapHospitalRow,
    "mapTreatmentRow",
    ()=>mapTreatmentRow,
    "normalizeImages",
    ()=>normalizeImages
]);
const normalizeImages = (raw)=>{
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
        if (t.startsWith("http")) return [
            t
        ];
    }
    return [];
};
const mapHospitalRow = (h)=>{
    if (!h) return null; // 🔥 안전장치: 데이터 없으면 터지지 않고 null 반환
    return {
        id: h.id,
        slug: h.slug ?? null,
        name: h.name,
        location: h.location ?? h.location_en ?? h.location_kr ?? '',
        address_detail: h.address_detail ?? '',
        description: h.description,
        tags: Array.isArray(h.tags) ? h.tags : [],
        rating: h.rating ?? 0,
        reviewsCount: h.reviews_count ?? 0,
        images: normalizeImages(h.images),
        latitude: h.latitude ?? null,
        longitude: h.longitude ?? null,
        operating_hours: h.operating_hours ?? null,
        doctorProfile: h.doctor_profile || null
    };
};
const mapTreatmentRow = (t)=>{
    if (!t) return null; // 🔥 안전장치
    return {
        id: t.id,
        slug: t.slug ?? null,
        title: t.name,
        desc: t.description,
        fullDescription: t.full_description,
        hospitalId: t.hospital_id,
        price: t.price_min ? `$${t.price_min.toLocaleString("en-US")}` : "Inquire",
        tags: Array.isArray(t.tags) ? t.tags : [],
        images: normalizeImages(t.images),
        benefits: Array.isArray(t.benefits) ? t.benefits : [],
        // Join된 병원 정보가 있다면 매핑 (없으면 기본값)
        hospitalName: t.hospitals?.name || "Partner Hospital",
        hospitalSlug: t.hospitals?.slug || null,
        hospitalLocation: t.hospitals?.location || t.hospitals?.location_en || t.hospitals?.location_kr || "Seoul, Korea"
    };
};
}),
"[project]/src/lib/data/supabaseServer.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseServer",
    ()=>supabaseServer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://xppnvkuahlrdyfvabzur.supabase.co") || process.env.VITE_SUPABASE_URL;
const supabaseKey = ("TURBOPACK compile-time value", "sb_publishable_ui0m9IIp-8VQUfHLCb4d1w_LcwHa0Zd") || process.env.VITE_SUPABASE_KEY;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabaseServer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});
}),
"[project]/src/lib/data/treatments.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAllTreatments",
    ()=>getAllTreatments,
    "getFeaturedTreatments",
    ()=>getFeaturedTreatments,
    "getRelatedTreatments",
    ()=>getRelatedTreatments,
    "getTreatmentById",
    ()=>getTreatmentById,
    "getTreatmentBySlug",
    ()=>getTreatmentBySlug,
    "getTreatmentList",
    ()=>getTreatmentList,
    "getTreatmentSlugById",
    ()=>getTreatmentSlugById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mapper.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/supabaseServer.js [app-route] (ecmascript)");
;
;
const TREATMENT_SELECT = "id, slug, name, description, full_description, hospital_id, price_min, tags, images, benefits, hospitals(slug, name, location_en, location_kr)";
const TREATMENT_LIST_SELECT = "id, slug, created_at, updated_at";
const getFeaturedTreatments = async (limit = 6)=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).order("created_at", {
        ascending: false
    }).limit(limit);
    if (error) {
        console.error("[getFeaturedTreatments]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTreatmentRow"]).filter(Boolean);
};
const getAllTreatments = async ()=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).order("name", {
        ascending: true
    });
    if (error) {
        console.error("[getAllTreatments]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTreatmentRow"]).filter(Boolean);
};
const getTreatmentList = async ({ limit = 1000 } = {})=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_LIST_SELECT).order("updated_at", {
        ascending: false,
        nullsFirst: false
    }).limit(limit);
    if (error) {
        console.error("[getTreatmentList]", error);
        return [];
    }
    return data || [];
};
const getTreatmentById = async (id)=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).eq("id", id).single();
    if (error) {
        console.error("[getTreatmentById]", error);
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTreatmentRow"])(data);
};
const getTreatmentBySlug = async (slug)=>{
    if (!slug) return null;
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).eq("slug", slug).maybeSingle();
    if (error) {
        if (error?.message) console.error("[getTreatmentBySlug]", error);
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTreatmentRow"])(data);
};
const getTreatmentSlugById = async (id)=>{
    if (!id) return null;
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select("slug").eq("id", id).single();
    if (error) {
        console.error("[getTreatmentSlugById]", error);
        return null;
    }
    return data?.slug || null;
};
const getRelatedTreatments = async (hospitalId, excludeId)=>{
    if (!hospitalId) return [];
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).eq("hospital_id", hospitalId).neq("id", excludeId).limit(4);
    if (error) {
        console.error("[getRelatedTreatments]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTreatmentRow"]).filter(Boolean);
};
}),
"[project]/src/lib/data/hospitals.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAllHospitals",
    ()=>getAllHospitals,
    "getFeaturedHospitals",
    ()=>getFeaturedHospitals,
    "getHospitalById",
    ()=>getHospitalById,
    "getHospitalBySlug",
    ()=>getHospitalBySlug,
    "getHospitalList",
    ()=>getHospitalList,
    "getHospitalSlugById",
    ()=>getHospitalSlugById,
    "getHospitalTreatments",
    ()=>getHospitalTreatments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mapper.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/supabaseServer.js [app-route] (ecmascript)");
;
;
const HOSPITAL_SELECT = "id, slug, name, location_en, location_kr, address_detail, description, tags, rating, reviews_count, images, latitude, longitude, operating_hours, doctor_profile";
const HOSPITAL_LIST_SELECT = "id, slug, created_at, updated_at";
const getFeaturedHospitals = async (limit = 6)=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("hospitals").select(HOSPITAL_SELECT).order("created_at", {
        ascending: false
    }).limit(limit);
    if (error) {
        console.error("[getFeaturedHospitals]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapHospitalRow"]).filter(Boolean);
};
const getAllHospitals = async ()=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("hospitals").select(HOSPITAL_SELECT).order("name", {
        ascending: true
    });
    if (error) {
        console.error("[getAllHospitals]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapHospitalRow"]).filter(Boolean);
};
const getHospitalList = async ({ limit = 1000 } = {})=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("hospitals").select(HOSPITAL_LIST_SELECT).order("updated_at", {
        ascending: false,
        nullsFirst: false
    }).limit(limit);
    if (error) {
        console.error("[getHospitalList]", error);
        return [];
    }
    return data || [];
};
const getHospitalById = async (id)=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("hospitals").select(HOSPITAL_SELECT).eq("id", id).single();
    if (error) {
        console.error("[getHospitalById]", error);
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapHospitalRow"])(data);
};
const getHospitalBySlug = async (slug)=>{
    if (!slug) return null;
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("hospitals").select(HOSPITAL_SELECT).eq("slug", slug).maybeSingle();
    if (error) {
        if (error?.message) console.error("[getHospitalBySlug]", error);
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapHospitalRow"])(data);
};
const getHospitalSlugById = async (id)=>{
    if (!id) return null;
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("hospitals").select("slug").eq("id", id).single();
    if (error) {
        console.error("[getHospitalSlugById]", error);
        return null;
    }
    return data?.slug || null;
};
const getHospitalTreatments = async (hospitalId)=>{
    if (!hospitalId) return [];
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select("id, slug, name, description, full_description, hospital_id, price_min, tags, images, benefits, hospitals(slug, name, location_en, location_kr)").eq("hospital_id", hospitalId).order("name", {
        ascending: true
    });
    if (error) {
        console.error("[getHospitalTreatments]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTreatmentRow"]).filter(Boolean);
};
}),
"[project]/app/sitemap.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>sitemap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/treatments.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$hospitals$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/hospitals.js [app-route] (ecmascript)");
;
;
const DEFAULT_LIMIT = 1000;
const getBaseUrl = ()=>process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
async function sitemap() {
    const baseUrl = getBaseUrl();
    const now = new Date();
    // NOTE: For large datasets, increase limit or paginate in chunks.
    const [treatments, hospitals] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTreatmentList"])({
            limit: DEFAULT_LIMIT
        }),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$hospitals$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHospitalList"])({
            limit: DEFAULT_LIMIT
        })
    ]);
    const urls = [];
    for (const t of treatments || []){
        const slugOrId = t?.slug || t?.id;
        if (!slugOrId) continue;
        urls.push({
            url: `${baseUrl}/treatments/${slugOrId}`,
            lastModified: t?.updated_at || t?.created_at || now
        });
    }
    for (const h of hospitals || []){
        const slugOrId = h?.slug || h?.id;
        if (!slugOrId) continue;
        urls.push({
            url: `${baseUrl}/hospitals/${slugOrId}`,
            lastModified: h?.updated_at || h?.created_at || now
        });
    }
    return urls;
}
}),
"[project]/app/sitemap--route-entry.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sitemap$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/sitemap.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$metadata$2f$resolve$2d$route$2d$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js [app-route] (ecmascript)");
;
;
;
const contentType = "application/xml";
const cacheControl = "public, max-age=0, must-revalidate";
const fileType = "sitemap";
if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sitemap$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"] !== 'function') {
    throw new Error('Default export is missing in "./sitemap.js"');
}
async function GET() {
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sitemap$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    const content = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$metadata$2f$resolve$2d$route$2d$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRouteData"])(data, fileType);
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](content, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': cacheControl
        }
    });
}
;
}),
"[project]/app/sitemap--route-entry.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sitemap$2d2d$route$2d$entry$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["GET"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sitemap$2d2d$route$2d$entry$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/sitemap--route-entry.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$sitemap$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/sitemap.js [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d8aeaf4d._.js.map