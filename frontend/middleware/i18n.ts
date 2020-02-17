import {Middleware} from '@nuxt/types';

const DEFAULT_LANG = process.env.DEFAULT_LANG;

const i18nMiddleware: Middleware = async ({isHMR, app, route, error}): Promise<void> => {
    const accessor = app.$accessor;

    // If middleware is called from hot module replacement, ignore it
    if (isHMR) {
        return;
    }

    // Get locale from meta
    const locale = route.meta[0]?.locale || DEFAULT_LANG;
    if (!(locale && accessor.locales.includes(locale))) {
        return error({message: 'This page could not be found.', statusCode: 404});
    }

    // Set locale
    await accessor.changeLanguage(locale);
};

export default i18nMiddleware;
