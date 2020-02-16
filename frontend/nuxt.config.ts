/**
 * nuxt config
 * @file nuxt.config.ts
 * @author PeterPan
 */

import fs from 'fs';
import path from 'path';
import {config as dotenv} from 'dotenv';
import {Configuration} from '@nuxt/types';
import pkg from './package.json';

dotenv();
const isProd = process.env.NODE_ENV === 'production';
const baseUrl = '/';

const trimSuffix = (s: string | undefined): string => (s || '').replace(/\/$/, '');
const publicPath = isProd ? trimSuffix(process.env.PUBLIC_PATH) + baseUrl : '';

const APP = {
    name: pkg.name,
    version: pkg.version,
    title: pkg.title,
    description: pkg.description,
    author: pkg.author,
    keywords: pkg.keywords.join(',')
};

const config: Configuration = {
    mode: 'universal',
    modern: isProd,

    router: {
        base: baseUrl,
        middleware: ['i18n']
    },

    /*
     ** Headers of the page
     */
    head: {
        title: pkg.title,
        titleTemplate: `%s - ${pkg.title}`,
        meta: [
            {charset: 'utf-8'},
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                hid: 'description',
                name: 'description',
                content: pkg.description
            }
        ],
        link: [
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '96x96',
                href: '/favicon.png'
            }
        ]
    },

    // client environment variables
    env: {
        PUBLIC_PATH: publicPath,
        LOCALES: fs
            .readdirSync(path.resolve(__dirname, 'static/locales'))
            .map(locale => path.basename(locale, '.json'))
            .join(','),
        ...APP
    },

    /*
     ** Customize the progress-bar color
     */
    loading: {color: '#1f6fed', height: '2px'},

    /*
     ** Global CSS
     */
    css: ['normalize.css'],

    /*
     ** Plugins to load before mounting the App
     */
    plugins: ['~/plugins/composition-api', '~/plugins/axios', '~/plugins/i18n', '~/plugins/style'],

    /*
     ** Nuxt.js dev-modules
     */
    buildModules: [
        '@nuxt/typescript-build',
        // Doc: https://github.com/nuxt-community/eslint-module
        '@nuxtjs/eslint-module',
        // Doc: https://nuxt-typed-vuex.danielcroe.com/
        'nuxt-typed-vuex'
    ],

    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://github.com/nuxt-community/axios-module#usage
        '@nuxtjs/axios',
        // Doc: https://github.com/nuxt-community/dotenv-module
        '@nuxtjs/dotenv'
    ],

    /*
     ** Axios module configuration
     */
    axios: {
        baseURL: process.env.API_BASE_URL
        // See https://github.com/nuxt-community/axios-module#options
    },

    typescript: {
        typeCheck: {
            eslint: true
        }
    },

    /*
     ** Build configuration
     */
    build: {
        publicPath,
        extractCSS: isProd,
        // parallel: true,
        transpile: [/typed-vuex/],

        babel: {
            presets({isServer}) {
                return [
                    // https://github.com/vuejs/composition-api/issues/168#issuecomment-548377182
                    'vca-jsx',
                    [
                        require.resolve('@nuxt/babel-preset-app'),
                        {
                            buildTarget: isServer ? 'server' : 'client',
                            corejs: {version: 3}
                        }
                    ]
                ];
            }
        },

        /*
         ** You can extend webpack config here
         */
        extend(config): void {
            config.devtool = isProd ? 'source-map' : false;
            config.module?.rules.push({
                test: /\.ya?ml$/,
                use: 'js-yaml-loader'
            });
        }
    },

    server: {
        port: process.env.PORT || 8999,
        host: process.env.HOST || '127.0.0.1'
    }
};

export default config;
