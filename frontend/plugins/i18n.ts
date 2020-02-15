import i18next from 'i18next';
import {Plugin} from '@nuxt/types';
import en from '~/locales/en.json';

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

const i18nPlugin: Plugin = async (context, inject): Promise<void> => {
    await i18next.init({
        lng: 'en',
        resources: {
            en
        }
    });

    inject('i18n', i18next);
};

export default i18nPlugin;
