"use client";

import { Suspense, useEffect, useState } from "react";
import { InquiryIntakePage } from "./IntakeClient";
import { useRouter } from "next/navigation";
import { getLangCodeFromCookie, t } from "../../../src/lib/i18n";

function InquiryIntakeContent() {
  const router = useRouter();
  const setView = (viewName) => {
    if (viewName === "home") router.push("/");
    else router.push("/");
  };
  return <InquiryIntakePage setView={setView} />;
}

export default function InquiryIntake() {
  const [langCode, setLangCode] = useState("en");
  useEffect(() => { setLangCode(getLangCodeFromCookie()); }, []);

  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8">{t("list.loading", langCode)}</div>}>
      <InquiryIntakeContent />
    </Suspense>
  );
}
