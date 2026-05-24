import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import arCommon from '@/locales/ar/common.json';
import deCommon from '@/locales/de/common.json';
import enCommon from '@/locales/en/common.json';
import esCommon from '@/locales/es/common.json';
import frCommon from '@/locales/fr/common.json';
import itCommon from '@/locales/it/common.json';
import ptCommon from '@/locales/pt/common.json';

const RTL_LANGUAGES = ['ar'];

export function applyRTL(language: string): void {
  const isRTL = RTL_LANGUAGES.includes(language);
  I18nManager.forceRTL(isRTL);
}

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: frCommon },
    en: { common: enCommon },
    es: { common: esCommon },
    it: { common: itCommon },
    ar: { common: arCommon },
    pt: { common: ptCommon },
    de: { common: deCommon },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  // Requis pour React Native : l'API Intl n'est pas toujours disponible
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
