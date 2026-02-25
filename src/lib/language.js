// src/lib/language.js
// Language utility for multilingual content resolution

export const SUPPORTED_LANGS = ["ko", "en", "zh", "ja"];

export const getCurrentLanguage = () => {
  if (typeof document === 'undefined') return 'ENG';
  
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(row => row.trim().startsWith('googtrans='));
  
  if (langCookie) {
    const langCode = langCookie.split('=')[1].split('/').pop();
    if (langCode === 'ko') return 'KR';
    if (langCode === 'zh-CN') return 'ZH';
    if (langCode === 'ja') return 'JA';
  }
  
  return 'ENG';
};

export const getCurrentLangCode = () => {
  if (typeof document === 'undefined') return 'en';
  
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(row => row.trim().startsWith('googtrans='));
  
  if (langCookie) {
    const langCode = langCookie.split('=')[1].split('/').pop();
    if (langCode === 'ko') return 'ko';
    if (langCode === 'zh-CN') return 'zh';
    if (langCode === 'ja') return 'ja';
  }
  
  return 'en';
};

export const getLocationColumn = (lang = null) => {
  const currentLang = lang || getCurrentLanguage();
  return currentLang === 'KR' ? 'location_kr' : 'location_en';
};

/**
 * Resolve a localized field from a DB record's i18n JSONB.
 * Falls back: i18n[lang][field] -> i18n.en[field] -> record[field] -> fallback
 */
export const localize = (record, field, lang) => {
  if (!record) return '';
  const langCode = lang || getCurrentLangCode();
  
  const i18nVal = record?.i18n?.[langCode]?.[field];
  if (i18nVal !== undefined && i18nVal !== null && i18nVal !== '') return i18nVal;
  
  if (langCode === 'ko') return record?.[field] ?? '';
  
  if (langCode !== 'en') {
    const enVal = record?.i18n?.en?.[field];
    if (enVal !== undefined && enVal !== null && enVal !== '') return enVal;
  }
  
  return record?.[field] ?? '';
};

/**
 * Resolve a localized array field (tags, specialties).
 * Falls back: i18n[lang][field] -> i18n.en[field] -> record[field] -> []
 */
export const localizeArray = (record, field, lang) => {
  if (!record) return [];
  const langCode = lang || getCurrentLangCode();
  
  const i18nVal = record?.i18n?.[langCode]?.[field];
  if (Array.isArray(i18nVal) && i18nVal.length > 0) return i18nVal;
  
  if (langCode === 'ko') {
    const direct = record?.[field];
    return Array.isArray(direct) ? direct : [];
  }
  
  if (langCode !== 'en') {
    const enVal = record?.i18n?.en?.[field];
    if (Array.isArray(enVal) && enVal.length > 0) return enVal;
  }
  
  const direct = record?.[field];
  return Array.isArray(direct) ? direct : [];
};

/**
 * Resolve localized location. Special handling for location_kr / location_en columns.
 */
export const localizeLocation = (record, lang) => {
  if (!record) return '';
  const langCode = lang || getCurrentLangCode();
  
  const i18nLoc = record?.i18n?.[langCode]?.location;
  if (i18nLoc) return i18nLoc;
  
  if (langCode === 'ko') return record?.location_kr || record?.location_en || record?.location || '';
  return record?.location_en || record?.location || record?.location_kr || '';
};
