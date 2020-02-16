import {Middleware} from '@nuxt/types';
import {DEFAULT_LANG} from '~/plugins/i18n';

const i18nMiddleware: Middleware = async ({isHMR, app, route, error, redirect}): Promise<void> => {
    const accessor = app.$accessor;

    // If middleware is called from hot module replacement, ignore it
    if (isHMR) {
        return;
    }

    // Get locale from params
    const {lang: paramLang, ...params} = route.params;
    const locale = paramLang || DEFAULT_LANG;
    if (!(locale && accessor.locales.includes(locale))) {
        return error({message: 'This page could not be found.', statusCode: 404});
    }

    // Set locale
    await accessor.changeLanguage(locale);

    // If route is /<DEFAULT_LANG>/... -> redirect to /...
    if (paramLang === DEFAULT_LANG) {
        return redirect({
            name: route.name?.replace(/^lang-/, ''),
            params,
            query: route.query,
            hash: route.hash
        });
    }
};

export default i18nMiddleware;
