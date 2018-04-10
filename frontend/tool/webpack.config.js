'use strict';
const webpack = require('webpack');
const path = require('path');
const projectPath = path.resolve(__dirname, '..');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const argv = require('yargs').argv;
const isDev = process.env.NODE_ENV === 'dev';
const entry = require('./entry');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function getLoaders(isDev, ext) {
    let arr = ['css-loader'];
    if (ext) {
        arr.push(ext + '-loader');
    }
    if (isDev) {
        arr.unshift('style-loader');
        return arr;
    }

    return ExtractTextPlugin.extract({
        use: arr,
        fallback: 'style-loader'
    });

}

/**
 * entry config
 *
 * @type {Object}
 */

const ENTR_CONFIG = entry.get(argv.app, argv.template);
/**
 * webpack config
 *
 * @type {Object}
 */
const config = {
    entry: ENTR_CONFIG.module,
    output: {
        path: path.resolve(projectPath, 'dist'),
        filename: '[name].[hash].js'
    },
    resolve: {

        alias: {
            axios: 'axios/dist/axios.min.js',
            'vue$': 'vue/dist/vue.esm.js',
            '@': path.resolve(projectPath, 'src'),
            style: path.resolve(__dirname, '../src/style')
        },

        extensions: ['.js', '.json', '.styl', '.css', '.html', '.vue']
    },

    module: {
        noParse: [
            /node_modules\/(axios)\//
        ],
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: [
                    path.resolve(projectPath, 'src')
                ],
                loader: 'babel-loader'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.html/,
                loader: 'html-loader',
                options: {
                    minimize: false
                }
            },
            {
                test: /\.css$/,
                use: getLoaders(isDev)
            },
            {
                test: /\.styl$/,
                use: getLoaders(isDev, 'stylus')
            },
            {
                test: /\.(gif|png|jpe?g|svg|wav)$/i,
                loader: 'file-loader',
                options: {
                    name: 'assets/[name].[hash].[ext]'
                }
            },
            {
                test: /\.woff2?$/,
                loader: 'url-loader',
                options: {
                    name: 'fonts/[name].[hash].[ext]',
                    limit: '10000',
                    mimetype: 'application/font-woff'
                }
            },
            {
                test: /\.(ttf|eot)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[hash].[ext]'
                }
            }
        ]
    },
    plugins: [

        new CaseSensitivePathsPlugin(),
        new webpack.LoaderOptionsPlugin({
            test: /\.(styl)$/
        }),
        new ExtractTextPlugin({filename: '[name].css'})
    ],
    externals: {
        dagreD3: 'dagre-d3',
    }
};

// template config
config.plugins = config.plugins.concat(ENTR_CONFIG.template);

module.exports = config;
