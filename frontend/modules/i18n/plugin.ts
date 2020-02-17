import i18next, {InitOptions, Resource} from 'i18next';
import XHR from 'i18next-xhr-backend';
import {Plugin} from '@nuxt/types';

const loadLocaleBundle = ({resources, ...initOptions}: InitOptions): Promise<typeof i18next.t> => {
    // server
    if (process.server) {
        return i18next.init({...initOptions, resources});
    }

    // client
    return i18next.use(XHR).init({
        ...initOptions,
        backend: {
            loadPath: '<%= options.loadPath %>/{{lng}}.json?ns={{ns}}',
            allowMultiLoading: false,
            parse(data: string) {
                const record = JSON.parse(data);
                return record[initOptions.defaultNS || 'translation'];
            }
        }
    });
};

const i18nPlugin: Plugin = async ({params}, inject): Promise<void> => {
    const defaultLocale = '<%= options.defaultLocale %>';
    const lng = params.lang || defaultLocale;

    const initOptions: InitOptions = {
        lng,
        fallbackLng: [defaultLocale],
        ns: ['translation'],
        defaultNS: 'translation',
        resources: {}
    };

    if (process.server) {
        const locales = process.env.LOCALES ? process.env.LOCALES.split(',') : ([] as string[]);
        for (const lang of locales) {
            (initOptions.resources as Resource)[lang] = (
                await import(`<%= options.localeDir %>/${lang}<%= options.ext %>`)
            ).default;
        }
    }

    await loadLocaleBundle(initOptions);

    inject('i18n', i18next);
};

export default i18nPlugin;
