import i18next, {InitOptions, Resource} from 'i18next';
import {Plugin} from '@nuxt/types';
import XHR from 'i18next-xhr-backend';

declare module 'vue/types/vue' {
    interface Vue {
        $i18n: typeof i18next;
    }
}

declare module '@nuxt/types' {
    interface NuxtAppOptions {
        $i18n: typeof i18next;
    }
}

declare module 'vuex/types/index' {
    interface Store<S> {
        $i18n: typeof i18next;
    }
}

const DEFAULT_LANG = 'en';

const loadLocaleBundle = ({resources, ...initOptions}: InitOptions): Promise<typeof i18next['t']> => {
    // server
    if (process.server) {
        return i18next.init({...initOptions, resources});
    }

    // client
    return i18next.use(XHR).init({
        ...initOptions,
        backend: {
            loadPath: '/locales/{{lng}}?ns={{ns}}',
            allowMultiLoading: false,
            parse(data: string) {
                const record: {translation: Record<string, unknown>} = JSON.parse(data);
                return record.translation;
            }
        }
    });
};

const i18nPlugin: Plugin = async ({params, app}, inject): Promise<void> => {
    const lng = params.lang || DEFAULT_LANG;

    const initOptions: InitOptions = {
        lng,
        fallbackLng: [DEFAULT_LANG],
        ns: ['translation'],
        defaultNS: 'translation',
        resources: {}
    };

    if (process.server) {
        for (const lang of app.$accessor.locales) {
            (initOptions.resources as Resource)[lang] = (await import(`~/locales/${lang}.yml`)).default;
        }
    }

    await loadLocaleBundle(initOptions);
    inject('i18n', i18next);
};

export default i18nPlugin;
