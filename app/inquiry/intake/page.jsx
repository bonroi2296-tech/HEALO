"use client";

import { InquiryIntakePage } from "../../../src/legacy-pages/InquiryIntakePage";
import { useRouter } from "next/navigation";

export default function InquiryIntake() {
  const router = useRouter();
  const setView = (viewName) => {
    if (viewName === "home") router.push("/");
    else router.push("/");
  };
  return <InquiryIntakePage setView={setView} />;
}
