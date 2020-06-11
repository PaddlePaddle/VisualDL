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
        API_TOKEN_KEY: process.env.API_TOKEN_KEY || '',
        PUBLIC_PATH: publicPath,
        API_URL: apiUrl
    },
    exportPathMap: defaultPathMap => ({
        ...defaultPathMap,
        ...Object.entries(defaultPathMap).reduce((prev, [path, router]) => {
            otherLanguages.forEach(lang => (prev[`/${lang}${path}`] = router));
            return prev;
        }, {})
    }),
    experimental: {
        basePath: publicPath
    },
    webpack: config => {
        const WorkerPlugin = require('worker-plugin');
        const CopyWebpackPlugin = require('copy-webpack-plugin');

        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['~'] = path.resolve(__dirname);

        config.node = Object.assign({}, config.node, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            child_process: 'empty',
            fs: 'empty'
        });

        config.plugins = [
            ...(config.plugins || []),
            new WorkerPlugin({
                globalObject: 'self'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        context: path.dirname(require('enhanced-resolve').sync(__dirname, '@visualdl/netron')),
                        from: '**/*',
                        to: 'static/netron',
                        toType: 'dir'
                    }
                ]
            })
        ];

        return config;
    }
};
