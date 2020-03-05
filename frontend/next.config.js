/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const pkg = require('./package.json');

const publicPath = process.env.PUBLIC_PATH || '';
const apiUrl = process.env.API_URL || '/api';
const distDir = 'dist';

const APP = {
    name: pkg.name,
    version: pkg.version,
    title: pkg.title,
    description: pkg.description,
    author: pkg.author,
    keywords: pkg.keywords.join(',')
};

const DEFAULT_LANGUAGE = 'en';
const LOCALE_PATH = 'public/locales';
const LANGUAGES = ['en', 'zh'];
const otherLanguages = LANGUAGES.filter(lang => lang !== DEFAULT_LANGUAGE);

module.exports = {
    target: 'serverless',
    assetPrefix: publicPath,
    distDir,
    poweredByHeader: false,
    env: {
        ...APP,
        DEFAULT_LANGUAGE,
        LOCALE_PATH,
        LANGUAGES,
        PUBLIC_PATH: publicPath,
        API_URL: apiUrl
    },
    exportPathMap: defaultPathMap => {
        return {
            ...defaultPathMap,
            ...Object.entries(defaultPathMap).reduce((prev, [path, router]) => {
                otherLanguages.forEach(lang => (prev[`/${lang}${path}`] = router));
                return prev;
            }, {})
        };
    },
    experimental: {
        basePath: publicPath
    },
    webpack: config => {
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['~'] = path.resolve(__dirname);
        return config;
    }
};
