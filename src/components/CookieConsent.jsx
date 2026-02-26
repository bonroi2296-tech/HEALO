"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "healo_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem(STORAGE_KEY);
        if (!consent) {
          setVisible(true);
        }
      } catch {
        setVisible(true);
      }
    };
    checkConsent();
  }, []);

  const handleConsent = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage unavailable
    }
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-change"));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-t-xl shadow-lg border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 text-sm text-gray-700">
            <p>
              We use cookies to improve your experience. Essential cookies are
              required for the site to function. Analytics cookies help us
              improve our service.{" "}
              <a
                href="/cookies"
                className="text-teal-600 underline hover:text-teal-700"
              >
                Cookie Policy
              </a>
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => handleConsent("essential")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => handleConsent("all")}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
