/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../../types/nuxt-shim.d.ts" />

import path from 'path';
import {promises as fs} from 'fs';
import url from 'url';
import {Module, ModuleThis} from '@nuxt/types';
import extendsBuild from './webpack';
import buildLocales from './build';
import injectEnv from './env';
import injectRoute from './route';
import logger from './logger';

export interface ModuleOptions {
    defaultLocale?: string;
    localeDir?: string;
    localePath?: string;
    localesEnv?: string | false;
    defaultLocaleEnv?: string | false;
    ext?: string;
}

export interface ModuleFunction<T> {
    (this: ModuleThis, options: Required<ModuleOptions>, locales: string[]): T;
}

const localeModule: Module = async function localeModule(moduleOptions: ModuleOptions = {}) {
    const options = Object.assign(
        {
            defaultLocale: 'en',
            localeDir: './locales',
            localePath: 'locales',
            localesEnv: 'LOCALES',
            defaultLocaleEnv: 'DEFAULT_LANG',
            ext: '.yml'
        },
        this.options.locale,
        moduleOptions
    );

    // add webpack yml loader
    this.extendBuild(extendsBuild());

    const localeDir = options.localeDir = path.resolve(this.options.srcDir || '.', options.localeDir);
    let locales: string[] = [];
    const stat = await fs.stat(localeDir);
    if (stat.isDirectory()) {
        locales = (await fs.readdir(localeDir))
            .filter(locale => locale.endsWith(options.ext))
            .map(locale => path.join(localeDir, locale));
        if (!locales.length) {
            logger.warn(`no locale file found in \`${localeDir}\`.`);
        }
    } else {
        logger.warn(`\`${localeDir}\` is not exist.`);
    }

    const callWithContext = <T>(fn: ModuleFunction<T>) => fn.call(this, options, locales);

    callWithContext(injectEnv);
    callWithContext(injectRoute);

    this.addPlugin({
        src: path.resolve(__dirname, './plugin.ts'),
        options: {
            ...options,
            loadPath: url.resolve(this.options.build?.publicPath || '', options.localePath)
        }
    });

    this.nuxt.hook('build:done', callWithContext(buildLocales));
};

export default localeModule;
