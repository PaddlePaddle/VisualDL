/* eslint-disable @typescript-eslint/no-explicit-any */

import {consoleMessage, isServer} from '../utils';

import {Config} from '../../types';
import {defaultConfig} from './default-config';

const deepMergeObjects = ['backend', 'detection'];
const dedupe = (names: string[]) => names.filter((v, i) => names.indexOf(v) === i);
const STATIC_LOCALE_PATH = 'static/locales';

export const createConfig = (userConfig: Config): Config => {
    if (typeof userConfig.localeSubpaths === 'string') {
        throw new Error('The localeSubpaths option has been changed to an object. Please refer to documentation.');
    }

    /*
        Initial merge of default and user-provided config
    */
    const combinedConfig = {
        ...defaultConfig,
        ...userConfig
    };

    /*
        Sensible defaults to prevent user duplication
    */
    combinedConfig.allLanguages = dedupe(combinedConfig.otherLanguages.concat([combinedConfig.defaultLanguage]));
    combinedConfig.whitelist = combinedConfig.allLanguages;

    const {allLanguages, defaultLanguage, localeExtension, localePath, localeStructure} = combinedConfig;

    if (isServer()) {
        const fs = eval("require('fs')");
        const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

        const projectRoot = combinedConfig.projectRoot || process.cwd();
        let serverLocalePath = localePath;

        /*
            Validate defaultNS
            https://github.com/isaachinman/next-i18next/issues/358
        */
        if (typeof combinedConfig.defaultNS === 'string') {
            const defaultFile = `/${defaultLanguage}/${combinedConfig.defaultNS}.${localeExtension}`;
            const defaultNSPath = path.join(projectRoot, localePath, defaultFile);
            const defaultNSExists = fs.existsSync(defaultNSPath);
            if (!defaultNSExists) {
                /*
                    If defaultNS doesn't exist, try to fall back to the deprecated static folder
                    https://github.com/isaachinman/next-i18next/issues/523
                */
                const staticDirPath = path.join(projectRoot, STATIC_LOCALE_PATH, defaultFile);
                const staticDirExists = fs.existsSync(staticDirPath);

                if (staticDirExists) {
                    consoleMessage(
                        'warn',
                        'next-i18next: Falling back to /static folder, deprecated in next@9.1.*',
                        combinedConfig as Config
                    );
                    serverLocalePath = STATIC_LOCALE_PATH;
                } else if (process.env.NODE_ENV !== 'production') {
                    throw new Error(`Default namespace not found at ${defaultNSPath}`);
                }
            }
        }

        /*
            Set server side backend
        */
        combinedConfig.backend = {
            loadPath: path.join(projectRoot, `${serverLocalePath}/${localeStructure}.${localeExtension}`),
            addPath: path.join(projectRoot, `${serverLocalePath}/${localeStructure}.missing.${localeExtension}`)
        };

        /*
            Set server side preload (languages and namespaces)
        */
        combinedConfig.preload = allLanguages;
        if (!combinedConfig.ns) {
            const getAllNamespaces = (p: string) =>
                fs.readdirSync(p).map((file: string) => file.replace(`.${localeExtension}`, ''));
            combinedConfig.ns = getAllNamespaces(path.join(projectRoot, `${serverLocalePath}/${defaultLanguage}`));
        }
    } else {
        let clientLocalePath = localePath;

        /*
            Remove public prefix from client site config
        */
        if (localePath.startsWith('public/')) {
            clientLocalePath = localePath.replace(/^public\//, '');
        }

        /*
            Set client side backend
        */
        const publicPath = (window as any).__vdl_public_path__ || '';
        combinedConfig.backend = {
            loadPath: `${publicPath}/${clientLocalePath}/${localeStructure}.${localeExtension}`,
            addPath: `${publicPath}/${clientLocalePath}/${localeStructure}.missing.${localeExtension}`
        };

        combinedConfig.ns = [combinedConfig.defaultNS];
    }

    /*
        Set fallback language to defaultLanguage in production
    */
    if (!userConfig.fallbackLng) {
        (combinedConfig as any).fallbackLng =
            process.env.NODE_ENV === 'production' ? combinedConfig.defaultLanguage : false;
    }

    /*
        Deep merge with overwrite - goes last
    */
    deepMergeObjects.forEach(obj => {
        if ((userConfig as any)[obj]) {
            (combinedConfig as any)[obj] = {
                ...(defaultConfig as any)[obj],
                ...(userConfig as any)[obj]
            };
        }
    });

    return combinedConfig as Config;
};
