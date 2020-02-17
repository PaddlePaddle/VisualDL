import {Middleware} from '@nuxt/types';

const i18nMiddleware: Middleware = async ({isHMR, app, route}): Promise<void> => {
    // If middleware is called from hot module replacement, ignore it
    if (isHMR) {
        return;
    }

    // Get locale from meta and set locale
    await app.$accessor.changeLanguage(route.meta[0]?.locale || process.env.DEFAULT_LANG);
};

export default i18nMiddleware;
