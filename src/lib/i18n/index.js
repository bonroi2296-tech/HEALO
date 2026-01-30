const DICTIONARY = {
  en: {
    "cta.freePlan": "Get Free Treatment Plan",
    "nav.treatments": "Treatments",
    "nav.hospitals": "Hospitals",
    "nav.about": "About HEALO",
    "nav.contact": "Contact",
    "nav.privacy": "Privacy Policy",
    "nav.terms": "Terms of Service",
    "auth.login": "Log In",
    "auth.signup": "Sign Up",
    "auth.logout": "Log Out",
    "auth.greeting": "Hi",
    "auth.signedInAs": "Signed in as",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "hero.title.line1": "Find the Best Hospital in Korea",
    "hero.title.highlight": "in 30 Seconds.",
    "hero.subtitle.line1":
      "AI compares treatments, doctors, and prices so you don't have to.",
    "hero.subtitle.line2": "Your personal medical concierge service.",
    "search.placeholder": "Try searching for 'Stem Cell'...",
    "search.button": "Search",
    "card.estPrice": "Est. Price",
    "price.inquire": "Inquire",
    "price.askQuote": "Ask for quote",
    "price.upTo": "Up to",
    "price.plus": "+",
    "list.treatments.title": "All Treatments",
    "list.hospitals.title": "Partner Hospitals",
    "meta.treatments.title": "Treatments",
    "meta.treatments.desc":
      "Browse all HEALO treatments and compare partner hospitals in Korea.",
    "meta.hospitals.title": "Hospitals",
    "meta.hospitals.desc": "Browse partner hospitals and clinics across Korea.",
  },
  ko: {},
  zh: {},
  ja: {},
};

export const getLangCodeFromCookie = () => {
  if (typeof document === "undefined") return "en";
  const cookies = document.cookie.split(";");
  const langCookie = cookies.find((row) => row.trim().startsWith("googtrans="));
  if (!langCookie) return "en";
  const langCode = langCookie.split("=")[1].split("/").pop();
  if (langCode === "ko") return "ko";
  if (langCode === "zh-CN") return "zh";
  if (langCode === "ja") return "ja";
  return "en";
};

export const getLangCodeFromLabel = (label) => {
  switch (label) {
    case "KOR":
      return "ko";
    case "CHN":
      return "zh";
    case "JPN":
      return "ja";
    case "ENG":
    default:
      return "en";
  }
};

export const t = (key, lang = "en") => {
  const langDict = DICTIONARY[lang] || DICTIONARY.en;
  return langDict[key] || DICTIONARY.en[key] || key;
};
