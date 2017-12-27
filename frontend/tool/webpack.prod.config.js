'use strict';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const autoprefixer = require('autoprefixer');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const bizCss = new ExtractTextPlugin('biz.[chunkhash].css');
let merge = require('webpack-merge');
let baseWebpackConfig = require('./webpack.config');
const autoPrefixOptions = {
    browsers: [
        'iOS >= 7',
        'Android >= 4.0',
        'ExplorerMobile >= 10',
        'ie >= 9'
    ]
};

/**
 * pro config
 *
 * @type {Object}
 */

module.exports = merge(baseWebpackConfig, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': 'production'
            }
        }),

        new webpack.LoaderOptionsPlugin({
            test: /\.(styl|san)$/,
            san: {
                autoprefixer: autoPrefixOptions
            }
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.[chunkhash].js',
            minChunks: function (module, count) {
                const resPath = module.resource;
                return resPath && /\.js$/.test(resPath)
                    && resPath.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0;
            }
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            minChunks: Infinity
        }),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                'screw_ie8': true, // no ie6/7/8
                'warnings': false
            },
            comments: false,
            sourceMap: false
        }),

        bizCss,

        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        })
    ]
});
