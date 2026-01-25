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
        title: t.name,
        desc: t.description,
        fullDescription: t.full_description,
        hospitalId: t.hospital_id,
        price: t.price_min ? `$${t.price_min.toLocaleString()}` : "Inquire",
        tags: Array.isArray(t.tags) ? t.tags : [],
        images: normalizeImages(t.images),
        benefits: Array.isArray(t.benefits) ? t.benefits : [],
        // Join된 병원 정보가 있다면 매핑 (없으면 기본값)
        hospitalName: t.hospitals?.name || "Partner Hospital",
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
    ()=>getTreatmentById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mapper.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/supabaseServer.js [app-rsc] (ecmascript)");
;
;
const TREATMENT_SELECT = "id, name, description, full_description, hospital_id, price_min, tags, images, benefits, hospitals(name, location_en, location_kr)";
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
const getTreatmentById = async (id)=>{
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$supabaseServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseServer"].from("treatments").select(TREATMENT_SELECT).eq("id", id).single();
    if (error) {
        console.error("[getTreatmentById]", error);
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mapper$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mapTreatmentRow"])(data);
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
"[project]/app/treatments/page.jsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TreatmentsPage,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/treatments.js [app-rsc] (ecmascript)");
;
;
;
const metadata = {
    title: "Treatments",
    description: "Browse all HEALO treatments and compare partner hospitals in Korea."
};
async function TreatmentsPage() {
    const treatments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$treatments$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllTreatments"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "max-w-6xl mx-auto px-4 py-10 space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold text-gray-900",
                        children: "All Treatments"
                    }, void 0, false, {
                        fileName: "[project]/app/treatments/page.jsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "Explore every treatment and request a personalized quote."
                    }, void 0, false, {
                        fileName: "[project]/app/treatments/page.jsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/treatments/page.jsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-3",
                children: [
                    treatments.map((treatment)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: `/treatments/${treatment.id}`,
                            className: "bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-900",
                                    children: treatment.title
                                }, void 0, false, {
                                    fileName: "[project]/app/treatments/page.jsx",
                                    lineNumber: 28,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-500 mt-1 line-clamp-3",
                                    children: treatment.desc || treatment.fullDescription
                                }, void 0, false, {
                                    fileName: "[project]/app/treatments/page.jsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-gray-700 mt-3",
                                    children: treatment.hospitalName
                                }, void 0, false, {
                                    fileName: "[project]/app/treatments/page.jsx",
                                    lineNumber: 34,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, treatment.id, true, {
                            fileName: "[project]/app/treatments/page.jsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this)),
                    treatments.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-500",
                        children: "No treatments available."
                    }, void 0, false, {
                        fileName: "[project]/app/treatments/page.jsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/treatments/page.jsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/treatments/page.jsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/treatments/page.jsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/treatments/page.jsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__35db31c1._.js.map