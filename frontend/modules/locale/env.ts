import path from 'path';
import {ModuleThis} from '@nuxt/types';
import {ModuleOptions} from './index';
import logger from './logger';

export default function injectEnv(this: ModuleThis, options: Required<ModuleOptions>, locales: string[]): void {
    this.options.env = this.options.env || {};

    if (options.localesEnv) {
        this.options.env[options.localesEnv] = locales.map(locale => path.basename(locale, options.ext)).join(',');
        logger.debug(`env \`${options.localesEnv}\` is set to \`${this.options.env[options.localesEnv]}\`.`);
    }

    if (options.defaultLocaleEnv) {
        this.options.env[options.defaultLocaleEnv] = options.defaultLocale;
        logger.debug(`env \`${options.defaultLocaleEnv}\` is set to \`${options.defaultLocale}\`.`);
    }
}
