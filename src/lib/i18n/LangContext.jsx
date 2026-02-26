"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getLangCodeFromCookie } from "./index";

const LangContext = createContext("en");

export function LangProvider({ children }) {
  const [langCode, setLangCode] = useState("en");
  useEffect(() => {
    setLangCode(getLangCodeFromCookie());
  }, []);
  return (
    <LangContext.Provider value={langCode}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const lang = useContext(LangContext);
  return lang || "en";
}
