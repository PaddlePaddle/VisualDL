/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const pkg = require('./package.json');

const publicPath = process.env.PUBLIC_PATH || '';
const apiUrl = process.env.API_URL || '/api';

const APP = {
    name: pkg.name,
    version: pkg.version,
    title: pkg.title,
    description: pkg.description,
    author: pkg.author,
    keywords: pkg.keywords.join(',')
};

module.exports = {
    assetPrefix: publicPath,
    distDir: 'dist',
    poweredByHeader: false,
    env: {
        ...APP,
        PUBLIC_PATH: publicPath,
        API_URL: apiUrl
    },
    webpack: config => {
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['~'] = path.resolve(__dirname);
        return config;
    }
};
