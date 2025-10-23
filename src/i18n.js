import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Loads translations from a server (e.g., /locales/en/translation.json)
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    // Languages to support
    supportedLngs: ['en', 'hi', 'te'],
    
    // The default language
    fallbackLng: 'en',
    
    // Configuration for i18next-http-backend
    // This tells it to look for your translation files in the `public/locales` folder
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Configuration for the language detector
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
    
    // Disables i18next's default escaping, as React already does it
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;

