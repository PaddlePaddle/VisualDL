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
    entry: {
        index: './src/index.js',
        shim: './src/shim.js',
        style: './src/style.scss'
    },
    output: {
        path: output,
        filename: '[name].[hash].js',
        publicPath: './'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/](?!netron)/,
                    chunks: 'all'
                }
            }
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
                transform: content => {
                    try {
                        const result = Terser.minify(content.toString());
                        if (result.error) {
                            throw result.error;
                        }
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
