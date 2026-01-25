module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.jsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.jsx [app-rsc] (ecmascript)"));
}),
"[project]/src/lib/policies.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EFFECTIVE_DATE",
    ()=>EFFECTIVE_DATE,
    "PRIVACY_POLICY",
    ()=>PRIVACY_POLICY,
    "PRIVACY_SECTIONS",
    ()=>PRIVACY_SECTIONS,
    "TERMS_OF_SERVICE",
    ()=>TERMS_OF_SERVICE,
    "TERMS_SECTIONS",
    ()=>TERMS_SECTIONS
]);
const EFFECTIVE_DATE = "2026-01-24";
const PRIVACY_SECTIONS = [
    {
        title: "Introduction",
        content: [
            "HEALO is an AI medical concierge platform that helps global patients find and connect with medical providers in Korea. We are not a medical institution and do not provide diagnosis or treatment.",
            "This Privacy Policy explains what information we collect, how we use it, and the choices you have."
        ]
    },
    {
        title: "Information We Collect",
        content: [
            "We collect information you provide directly, such as your name, email, and contact details.",
            "If you choose to request concierge support, we may collect health-related information you voluntarily provide (e.g., symptoms, desired procedures, or records) for matching purposes.",
            "We may collect technical information such as device and usage data to improve service reliability."
        ]
    },
    {
        title: "How We Use Information",
        content: [
            "To deliver concierge services, respond to inquiries, and match you with suitable medical providers.",
            "To communicate with you about your requests and service updates.",
            "To improve platform performance, safety, and user experience."
        ]
    },
    {
        title: "Sharing of Information",
        content: [
            "We share personal and medical information only with your consent and only with medical providers relevant to your request.",
            "We do not sell personal information to third parties.",
            "We may share information with service providers that help us operate the platform (e.g., hosting or email delivery), under confidentiality obligations."
        ]
    },
    {
        title: "Data Retention",
        content: [
            "We retain information only as long as necessary to provide services or meet legal obligations.",
            "You may request deletion of your account and related data, subject to legal requirements."
        ]
    },
    {
        title: "Data Security",
        content: [
            "We apply industry-standard safeguards to protect data against unauthorized access, loss, or misuse.",
            "No system is completely secure, and we cannot guarantee absolute security."
        ]
    },
    {
        title: "User Rights",
        content: [
            "You may request access to, correction of, or deletion of your personal information.",
            "You may withdraw consent for data sharing at any time, which may limit our ability to provide concierge services."
        ]
    },
    {
        title: "Contact Information",
        content: [
            "If you have any questions about this Privacy Policy or your data, contact us at contact@healo.com."
        ]
    }
];
const TERMS_SECTIONS = [
    {
        title: "Service Description",
        content: [
            "HEALO provides an AI medical concierge service that helps users explore medical options and connect with medical providers. HEALO is not a medical institution.",
            "We do not provide medical diagnosis, treatment, or medical advice."
        ]
    },
    {
        title: "User Responsibilities",
        content: [
            "You agree to provide accurate and up-to-date information when submitting inquiries.",
            "You are responsible for any decisions made based on information provided by medical providers.",
            "You must comply with applicable laws and hospital policies."
        ]
    },
    {
        title: "Medical Disclaimer",
        content: [
            "HEALO is a platform that facilitates communication between users and medical providers.",
            "Any medical care, diagnosis, or treatment is provided solely by the medical providers, not by HEALO.",
            "You acknowledge that medical outcomes may vary and are not guaranteed by HEALO."
        ]
    },
    {
        title: "Limitation of Liability",
        content: [
            "HEALO is not responsible for medical outcomes, side effects, or malpractice by medical providers.",
            "HEALO is not liable for disputes between users and medical providers.",
            "To the maximum extent permitted by law, HEALO disclaims liability for indirect or consequential damages."
        ]
    },
    {
        title: "Intellectual Property",
        content: [
            "All content, branding, and software on the HEALO platform are owned by HEALO or its licensors.",
            "You may not copy, modify, or distribute our content without permission."
        ]
    },
    {
        title: "Termination",
        content: [
            "We may suspend or terminate access to the platform if you violate these terms or misuse the service.",
            "You may discontinue use of the platform at any time."
        ]
    },
    {
        title: "Governing Law",
        content: [
            "These terms are governed by the laws of the Republic of Korea.",
            "Any disputes shall be resolved in the Seoul Central District Court."
        ]
    },
    {
        title: "Contact Information",
        content: [
            "If you have questions about these Terms, contact us at contact@healo.com."
        ]
    }
];
const buildPolicyText = (sections)=>{
    const lines = [
        `Last Updated: ${EFFECTIVE_DATE}`,
        ""
    ];
    sections.forEach((section)=>{
        lines.push(section.title);
        section.content.forEach((paragraph)=>{
            lines.push(paragraph);
        });
        lines.push("");
    });
    return lines.join("\n").trim();
};
const PRIVACY_POLICY = buildPolicyText(PRIVACY_SECTIONS);
const TERMS_OF_SERVICE = buildPolicyText(TERMS_SECTIONS);
}),
"[project]/app/terms/page.jsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TermsOfServicePage,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$policies$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/policies.js [app-rsc] (ecmascript)");
;
;
const metadata = {
    title: "Terms of Service | HEALO",
    description: "Terms and conditions for using HEALO's AI medical concierge and hospital matching services.",
    alternates: {
        canonical: "/terms"
    }
};
function TermsOfServicePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-3xl mx-auto px-4 py-12 text-gray-800",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold text-gray-900",
                    children: "Terms of Service"
                }, void 0, false, {
                    fileName: "[project]/app/terms/page.jsx",
                    lineNumber: 14,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-gray-500 mt-2",
                    children: [
                        "Last Updated: ",
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$policies$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EFFECTIVE_DATE"]
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/terms/page.jsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-8 space-y-8 text-sm leading-relaxed",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$policies$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TERMS_SECTIONS"].map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-900",
                                    children: section.title
                                }, void 0, false, {
                                    fileName: "[project]/app/terms/page.jsx",
                                    lineNumber: 22,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 space-y-3 text-gray-600",
                                    children: section.content.map((paragraph)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: paragraph
                                        }, paragraph, false, {
                                            fileName: "[project]/app/terms/page.jsx",
                                            lineNumber: 27,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/terms/page.jsx",
                                    lineNumber: 25,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, section.title, true, {
                            fileName: "[project]/app/terms/page.jsx",
                            lineNumber: 21,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/terms/page.jsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/terms/page.jsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/terms/page.jsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/terms/page.jsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/terms/page.jsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bc46c3af._.js.map