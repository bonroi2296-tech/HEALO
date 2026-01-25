"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminPage } from "../../src/AdminPage";

export default function AdminWrapper() {
  const router = useRouter();

  const setView = useMemo(
    () => (viewName) => {
      switch (viewName) {
        case "home":
          router.push("/");
          break;
        case "list_treatment":
          router.push("/treatments");
          break;
        case "list_hospital":
          router.push("/hospitals");
          break;
        case "admin":
          router.push("/admin");
          break;
        case "inquiry":
          router.push("/inquiry");
          break;
        case "login":
          router.push("/login");
          break;
        case "signup":
          router.push("/signup");
          break;
        default:
          router.push("/");
      }
    },
    [router]
  );

  return <AdminPage setView={setView} />;
}
