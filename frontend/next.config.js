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
    webpack: (config, {dev, webpack}) => {
        const WorkerPlugin = require('worker-plugin');

        config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';

        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['~'] = path.resolve(__dirname);

        config.node = Object.assign({}, config.node, {
            // eslint-disable-next-line @typescript-eslint/camelcase
            child_process: 'empty',
            fs: 'empty'
        });

        config.plugins = [
            ...(config.plugins || []),
            new WorkerPlugin({
                globalObject: 'self'
            })
        ];

        if (!dev || !!process.env.WITH_WASM) {
            const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
            config.plugins.push(
                new WasmPackPlugin({
                    crateDirectory: path.resolve(__dirname, 'wasm'),
                    outDir: 'dist',
                    outName: 'index'
                })
            );
        } else {
            config.plugins.push(new webpack.IgnorePlugin(/^~\/wasm\//));
        }

        return config;
    }
};
