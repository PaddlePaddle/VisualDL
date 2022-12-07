/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const Terser = require('terser');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const netron = path.dirname(require.resolve('netron/src'));
const output = path.resolve(__dirname, 'dist');

const excludes = ['index.js', 'view.js', 'view-sidebar.js', 'view-grapher.js', 'app.js', 'base.js', 'electron.js'];
const src = fs.readdirSync(netron, {encoding: 'utf-8'}).filter(file => fs.statSync(path.join(netron, file)).isFile());
const commons = src.filter(file => path.extname(file) === '.js' && !excludes.includes(file));
const metadata = src.filter(file => path.extname(file) === '.json');

module.exports = {
    mode: 'production',
    context: __dirname,
    stats: {
        assets: false,
        builtAt: true,
        cached: false,
        cachedAssets: false,
        children: false,
        chunks: false,
        chunkGroups: false,
        chunkModules: false,
        chunkOrigins: false,
        colors: true,
        entrypoints: false,
        errors: true,
        errorDetails: true,
        hash: true,
        modules: false,
        moduleTrace: false,
        performance: false,
        providedExports: false,
        publicPath: true,
        reasons: false,
        source: false,
        timings: true,
        usedExports: false,
        version: true,
        warnings: false
    },
    entry: {
        index: './src/index.js'
        // shim: './src/shim.js',
        // style: './src/style.scss'
    },
    output: {
        path: output,
        filename: '[name].[contenthash].js',
        publicPath: './'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                defaultVendors: {
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/](?!netron)/,
                    chunks: 'all'
                }
            }
        }
    },
    resolve: {
        fallback: {
            zlib: false
        }
    },
    module: {
        rules: [
            {
                test: /\.scss/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            pako: 'pako'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            inject: 'body',
            scriptLoading: 'blocking'
        }),
        new CopyWebpackPlugin({
            patterns: commons.map(file => ({
                from: path.join(netron, file),
                to: file,
                transform: async content => {
                    try {
                        // It is important to keep class names and function names after compressing
                        // Netron relies on Class.constructor.name and Function.prototype.name to show attribute's value
                        const result = await Terser.minify(content.toString(), {
                            keep_classnames: true,
                            keep_fnames: true
                        });
                        return result.code;
                    } catch (e) {
                        console.error(e);
                        return content;
                    }
                }
            }))
        }),
        new CopyWebpackPlugin({
            patterns: metadata.map(file => ({
                from: path.join(netron, file),
                to: file,
                transform: content => {
                    try {
                        return JSON.stringify(JSON.parse(content.toString()));
                    } catch (e) {
                        console.error(e);
                        return content;
                    }
                }
            }))
        })
    ]
};
