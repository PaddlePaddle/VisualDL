import Fetch from 'i18next-fetch-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import moment from 'moment';

const {SNOWPACK_PUBLIC_DEFAULT_LANGUAGE, SNOWPACK_PUBLIC_LANGUAGES, SNOWPACK_PUBLIC_PATH} = import.meta.env;

const defaultLanguage: string = SNOWPACK_PUBLIC_DEFAULT_LANGUAGE;
const allLanguages: string[] = SNOWPACK_PUBLIC_LANGUAGES.split(',');
const PUBLIC_PATH: string = SNOWPACK_PUBLIC_PATH;

allLanguages.forEach(async (lang: string) => {
    try {
        moment.updateLocale(lang, await (await fetch(`${PUBLIC_PATH}/locales/${lang}/moment.json`)).json());
    } catch {
        // ignore
    }
});

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
        react: {
            useSuspense: false
        },
        interpolation: {
            escapeValue: false
        },
        backend: {
            loadPath: `${PUBLIC_PATH}/locales/{{lng}}/{{ns}}.json`
        },
        detection: {
            order: ['localStorage', 'cookie', 'navigator'],
            lookupCookie: 'vdl_lng',
            lookupLocalStorage: 'vdlLng',
            caches: ['localStorage']
        }
    });
