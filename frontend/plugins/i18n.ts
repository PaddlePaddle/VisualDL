import i18next, {InitOptions} from 'i18next';
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

const loadLocaleBundle = async (initOptions: InitOptions) => {
    if (process.server) {
        // middleware will hanlde it
        return;
    }

    // client
    await i18next.use(XHR).init({
        ...initOptions,
        backend: {
            loadPath: '/locales/{{lng}}.json?ns={{ns}}',
            allowMultiLoading: false,
            parse(data: string) {
                const record: {translation: Record<string, unknown>} = JSON.parse(data);
                return record.translation;
            }
        }
    });
};

const i18nPlugin: Plugin = async (context, inject): Promise<void> => {
    const lng = context.params.lang || 'en';
    const initOptions = {
        lng,
        fallbackLng: [lng],
        ns: ['translation'],
        defaultNS: 'translation'
    };

    await loadLocaleBundle(initOptions);
    inject('i18n', i18next);
};

export default i18nPlugin;
