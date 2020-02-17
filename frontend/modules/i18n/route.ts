/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../../types/nuxt-utils.d.ts" />

import path from 'path';
import {sortRoutes} from '@nuxt/utils';
import {ModuleThis} from '@nuxt/types';
import {ModuleOptions} from './index';
import logger from './logger';

export default function injectRoute(this: ModuleThis, options: Required<ModuleOptions>, locales: string[]): void {
    const separator = '__';

    const oldExtendRoutes = this.options.router?.extendRoutes;

    this.options.router = {
        ...(this.options.router || {}),
        extendRoutes: (routes, resolve) => {
            if (oldExtendRoutes) {
                oldExtendRoutes(routes, resolve);
            }

            const joinPath = (path: string, locale: string): string =>
                path === '/' ? `/${locale}` : `/${locale}${path}`;

            const oldRoutes = [...routes];

            logger.debug(`old routes: ${JSON.stringify(oldRoutes, null, 2)}`);

            // 1. add default locale param routes
            Array.prototype.push.apply(
                routes,
                oldRoutes.map(route => ({
                    path: joinPath(route.path, options.defaultLocale),
                    redirect: {name: [options.defaultLocale, route.name].join(separator)}
                }))
            );

            // 2. add other locales
            locales
                .map(locale => path.basename(locale, options.ext))
                .filter(locale => locale !== options.defaultLocale)
                .forEach(locale => {
                    Array.prototype.push.apply(
                        routes,
                        oldRoutes.map(route => ({
                            ...route,
                            name: [locale, route.name].join(separator),
                            path: joinPath(route.path, locale),
                            meta: {
                                locale
                            }
                        }))
                    );
                });

            // 3. add default locale to route name
            oldRoutes.forEach(route => {
                route.name = [options.defaultLocale, route.name].join(separator);
                route.meta = Object.assign({}, route.meta, {locale: options.defaultLocale});
            });

            sortRoutes(routes);

            logger.debug(`new routes: ${JSON.stringify(routes, null, 2)}`);
        }
    };
}
