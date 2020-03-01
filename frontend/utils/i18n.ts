import i18n, {InitOptions} from 'i18next';
import {initReactI18next} from 'react-i18next';
import Backend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const options: InitOptions = {
    react: {
        useSuspense: false
    },

    load: 'languageOnly',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],

    interpolation: {
        escapeValue: false // not needed for react as it escapes by default
    }
};

if (process.browser) {
    i18n
        // load translation using xhr -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
        // learn more: https://github.com/i18next/i18next-xhr-backend
        .use(Backend)
        // detect user language
        // learn more: https://github.com/i18next/i18next-browser-languageDetector
        .use(LanguageDetector)
        // pass the i18n instance to react-i18next.
        .use(initReactI18next)
        // init i18next
        // for all options read: https://www.i18next.com/overview/configuration-options
        .init({
            backend: {
                backends: [LocalStorageBackend, XHR],
                backendOptions: [
                    {
                        defaultVersion: '1' // TODO: use build id
                    },
                    {
                        loadPath: `${process.env.PUBLIC_PATH}/locales/{{lng}}/{{ns}}.json`,
                        allowMultiLoading: false,
                        crossDomain: true,
                        overrideMimeType: true
                    }
                ]
            },

            detection: {},

            ...options
        });
} else {
    i18n.use(initReactI18next).init(options);
}

export default i18n;
