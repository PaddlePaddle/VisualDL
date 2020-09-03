import Fetch from 'i18next-fetch-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const {SNOWPACK_PUBLIC_DEFAULT_LANGUAGE, SNOWPACK_PUBLIC_LANGUAGES} = import.meta.env;

const defaultLanguage: string = SNOWPACK_PUBLIC_DEFAULT_LANGUAGE;
const allLanguages: string[] = SNOWPACK_PUBLIC_LANGUAGES.split(',');

i18n.use(initReactI18next)
    .use(Fetch)
    .use(LanguageDetector)
    .init({
        fallbackLng: defaultLanguage,
        supportedLngs: allLanguages,
        cleanCode: true,
        ns: 'common',
        defaultNS: 'common',
        load: 'currentOnly',
        interpolation: {
            escapeValue: false
        },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json'
        },
        detection: {
            order: ['cookie', 'localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });
