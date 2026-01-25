// src/lib/language.js
// Language utility to get current language from cookies

export const getCurrentLanguage = () => {
  if (typeof document === 'undefined') return 'ENG';
  
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(row => row.trim().startsWith('googtrans='));
  
  if (langCookie) {
    const langCode = langCookie.split('=')[1].split('/').pop();
    if (langCode === 'ko') return 'KR';
    // For other languages, default to ENG
  }
  
  return 'ENG';
};

// Get location column name based on language
export const getLocationColumn = (lang = null) => {
  const currentLang = lang || getCurrentLanguage();
  return currentLang === 'KR' ? 'location_kr' : 'location_en';
};
