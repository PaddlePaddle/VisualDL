/**
 * nuxt config
 * @file nuxt.config.ts
 * @author PeterPan
 */

import {config as dotenv} from 'dotenv';
import {Configuration} from '@nuxt/types';
import pkg from './package.json';

dotenv();
const isProd = process.env.NODE_ENV === 'production';
const baseUrl = '/';

const trimSuffix = (s: string | undefined): string => (s || '').replace(/\/$/, '');
const publicPath = trimSuffix(process.env.PUBLIC_PATH) + baseUrl;

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
        base: baseUrl
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
        ...APP
    },

    /*
     ** Customize the progress-bar color
     */
    loading: {color: '#1f6fed', height: '2px'},

    /*
     ** Global CSS
     */
    css: [],

    /*
     ** Plugins to load before mounting the App
     */
    plugins: ['~/plugins/composition-api'],

    /*
     ** Nuxt.js dev-modules
     */
    buildModules: [
        // Doc: https://github.com/nuxt-community/eslint-module
        '@nuxtjs/eslint-module',
        // Doc: https://github.com/nuxt-community/stylelint-module
        '@nuxtjs/stylelint-module',
        '@nuxt/typescript-build',
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
        '@nuxtjs/dotenv',
        '@nuxtjs/style-resources'
    ],

    styleResources: {
        scss: ['~/assets/style/variables.scss']
    },

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
        parallel: true,
        transpile: [/typed-vuex/],

        babel: {
            sourceType: 'unambiguous',
            compact: false
        },

        /*
         ** You can extend webpack config here
         */
        extend(config): void {
            config.devtool = isProd ? 'source-map' : false;
        }
    },

    server: {
        port: process.env.PORT || 8999,
        host: process.env.HOST || '127.0.0.1'
    }
};

export default config;
