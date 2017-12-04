import {router} from 'san-router';

export function routeTo(url, params = {}) {
    let paramsArr = Object.keys(params).map(key => `${key}=${params[key]}`);
    let urlParams = (url.indexOf('?') > -1 ? '&' : '?') + paramsArr.join('&');

    router.locator.redirect(urlParams.length > 1 ? `${url}${urlParams}` : url);
}
