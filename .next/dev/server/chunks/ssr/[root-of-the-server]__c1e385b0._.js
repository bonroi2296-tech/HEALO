module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.jsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.jsx [app-rsc] (ecmascript)"));
}),
"[project]/src/lib/mapper.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/lib/data/supabaseServer.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseServer",
    ()=>supabaseServer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://xppnvkuahlrdyfvabzur.supabase.co") || process.env.VITE_SUPABASE_URL;
const supabaseKey = ("TURBOPACK compile-time value", "sb_publishable_ui0m9IIp-8VQUfHLCb4d1w_LcwHa0Zd") || process.env.VITE_SUPABASE_KEY;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabaseServer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});
}),
"[project]/src/lib/data/treatments.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mapper.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/supabaseServer.js [app-rsc] (ecmascript)");
;
;
const TREATMENT_SELECT = "id, slug, name, description, full_description, hospital_id, price_min, tags, images, benefits, hospitals(slug, name, location_en, location_kr)";
const TREATMENT_LIST_SELECT = "id, slug, created_at, updated_at";
const getFeaturedTreatments = async (limit = 6)=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).order("created_at", {
        ascending: false
    }).limit(limit);
    if (error) {
        console.error("[getFeaturedTreatments]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapTreatmentRow"]).filter(Boolean);
};
const getAllTreatments = async ()=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).order("name", {
        ascending: true
    });
    if (error) {
        console.error("[getAllTreatments]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapTreatmentRow"]).filter(Boolean);
};
const getTreatmentList = async ({ limit = 1000 } = {})=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_LIST_SELECT).order("updated_at", {
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
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).eq("id", id).single();
    if (error) {
        console.error("[getTreatmentById]", error);
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapTreatmentRow"])(data);
};
const getTreatmentBySlug = async (slug)=>{
    if (!slug) return null;
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).eq("slug", slug).maybeSingle();
    if (error) {
        if (error?.message) console.error("[getTreatmentBySlug]", error);
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapTreatmentRow"])(data);
};
const getTreatmentSlugById = async (id)=>{
    if (!id) return null;
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select("slug").eq("id", id).single();
    if (error) {
        console.error("[getTreatmentSlugById]", error);
        return null;
    }
    return data?.slug || null;
};
const getRelatedTreatments = async (hospitalId, excludeId)=>{
    if (!hospitalId) return [];
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).eq("hospital_id", hospitalId).neq("id", excludeId).limit(4);
    if (error) {
        console.error("[getRelatedTreatments]", error);
        return [];
    }
    return (data || []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapTreatmentRow"]).filter(Boolean);
};
}),
"[project]/app/treatments/[slug]/TreatmentDetailClient.jsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/treatments/[slug]/TreatmentDetailClient.jsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/treatments/[slug]/TreatmentDetailClient.jsx <module evaluation>", "default");
}),
"[project]/app/treatments/[slug]/TreatmentDetailClient.jsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/treatments/[slug]/TreatmentDetailClient.jsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/treatments/[slug]/TreatmentDetailClient.jsx", "default");
}),
"[project]/app/treatments/[slug]/TreatmentDetailClient.jsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$treatments$2f5b$slug$5d2f$TreatmentDetailClient$2e$jsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/treatments/[slug]/TreatmentDetailClient.jsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$treatments$2f5b$slug$5d2f$TreatmentDetailClient$2e$jsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/treatments/[slug]/TreatmentDetailClient.jsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$treatments$2f5b$slug$5d2f$TreatmentDetailClient$2e$jsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/treatments/[slug]/page.jsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TreatmentDetailPage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/script.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/treatments.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$treatments$2f5b$slug$5d2f$TreatmentDetailClient$2e$jsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/treatments/[slug]/TreatmentDetailClient.jsx [app-rsc] (ecmascript)");
;
;
;
;
;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value)=>UUID_REGEX.test(String(value || ""));
const getBaseUrl = ()=>process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
async function generateMetadata({ params }) {
    const { slug } = await params;
    const treatment = slug ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTreatmentBySlug"])(slug) || (isUuid(slug) ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTreatmentById"])(slug) : null) : null;
    if (!treatment) return {};
    const description = treatment.desc || treatment.fullDescription || "Explore this HEALO treatment in Korea.";
    const canonical = `/treatments/${treatment.slug || slug}`;
    const ogImages = Array.isArray(treatment.images) && treatment.images.length > 0 ? [
        {
            url: treatment.images[0]
        }
    ] : undefined;
    return {
        title: treatment.title,
        description,
        alternates: {
            canonical
        },
        openGraph: {
            title: treatment.title,
            description,
            url: canonical,
            type: "article",
            images: ogImages
        },
        twitter: {
            card: ogImages ? "summary_large_image" : "summary",
            title: treatment.title,
            description,
            images: ogImages ? ogImages.map((img)=>img.url) : undefined
        }
    };
}
async function TreatmentDetailPage({ params }) {
    const { slug } = await params;
    if (slug && isUuid(slug)) {
        const resolvedSlug = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTreatmentSlugById"])(slug);
        if (resolvedSlug) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/treatments/${resolvedSlug}`);
    }
    const treatment = slug ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTreatmentBySlug"])(slug) || (isUuid(slug) ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTreatmentById"])(slug) : null) : null;
    if (!treatment) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const baseUrl = getBaseUrl();
    const canonical = `${baseUrl}/treatments/${treatment.slug || slug}`;
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "MedicalProcedure",
        name: treatment.title,
        description: treatment.desc || treatment.fullDescription || "Explore this HEALO treatment in Korea.",
        image: Array.isArray(treatment.images) && treatment.images.length > 0 ? treatment.images : undefined,
        url: canonical,
        provider: treatment.hospitalName ? {
            "@type": "MedicalOrganization",
            name: treatment.hospitalName,
            url: treatment.hospitalSlug ? `${baseUrl}/hospitals/${treatment.hospitalSlug}` : undefined,
            areaServed: "KR"
        } : undefined,
        areaServed: "KR",
        priceRange: treatment.price || undefined
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                id: "treatment-jsonld",
                type: "application/ld+json",
                dangerouslySetInnerHTML: {
                    __html: JSON.stringify(jsonLd)
                }
            }, void 0, false, {
                fileName: "[project]/app/treatments/[slug]/page.jsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$treatments$2f5b$slug$5d2f$TreatmentDetailClient$2e$jsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                id: slug
            }, void 0, false, {
                fileName: "[project]/app/treatments/[slug]/page.jsx",
                lineNumber: 99,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/app/treatments/[slug]/page.jsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/treatments/[slug]/page.jsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c1e385b0._.js.map