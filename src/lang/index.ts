import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { createInstance } from 'i18next';
import 'intl-pluralrules';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './ar.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import hi from './hi.json';

export const LANGUAGES = ['en', 'hi', 'es', 'fr', 'ar'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Arabic is the only right-to-left locale we ship today. */
const RTL: Language[] = ['ar'];

const STORAGE_KEY = 'skillio.language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
};

function deviceLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode;
  return LANGUAGES.includes(code as Language) ? (code as Language) : 'en';
}

/** Our own instance rather than the shared global — `initReactI18next` still
 * registers it as the one `useTranslation()` reads. */
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: 'en',
  supportedLngs: [...LANGUAGES],
  interpolation: { escapeValue: false },
  returnNull: false,
});

export const isRTLLanguage = (language: string) => RTL.includes(language as Language);

/**
 * React Native only flips layout after a restart, so this reports whether the
 * caller needs to reload the app rather than pretending the swap is instant.
 */
function applyDirection(language: Language) {
  const shouldBeRTL = isRTLLanguage(language);
  I18nManager.allowRTL(shouldBeRTL);
  if (I18nManager.isRTL === shouldBeRTL) return false;
  I18nManager.forceRTL(shouldBeRTL);
  return true;
}

export async function restoreLanguage() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.includes(saved as Language)) {
      await i18n.changeLanguage(saved);
    }
  } catch {
    // A missing preference just means we keep the device language.
  }
  applyDirection(i18n.language as Language);
}

export async function setLanguage(language: Language) {
  await i18n.changeLanguage(language);
  AsyncStorage.setItem(STORAGE_KEY, language).catch(() => {});
  return applyDirection(language);
}

export default i18n;
