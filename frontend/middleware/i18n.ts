import {Middleware} from '@nuxt/types';
import {DEFAULT_LANG} from '~/plugins/i18n';

const i18nMiddleware: Middleware = async ({isHMR, app, route, error, redirect}): Promise<void> => {
    const accessor = app.$accessor;

    // If middleware is called from hot module replacement, ignore it
    if (isHMR) {
        return;
    }

    // Get locale from params
    const {lang, ...params} = route.params;
    const locale = lang || DEFAULT_LANG;
    if (!(locale && accessor.locales.includes(locale))) {
        return error({message: 'This page could not be found.', statusCode: 404});
    }

    // Set locale
    await accessor.changeLanguage(locale);

    // If route is /<DEFAULT_LANG>/... -> redirect to /...
    if (lang === DEFAULT_LANG && route.name?.startsWith('lang')) {
        return redirect({
            name: route.name === 'lang' ? 'index' : route.name?.replace(/^lang-/, ''),
            params,
            query: route.query,
            hash: route.hash
        });
    }
};

export default i18nMiddleware;
