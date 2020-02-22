import path from 'path';
import {Configuration} from 'webpack';
import pkg from './package.json';

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

export default {
    assetPrefix: publicPath,
    poweredByHeader: false,
    env: {
        ...APP,
        PUBLIC_PATH: publicPath,
        API_URL: apiUrl
    },
    webpack: (config: Configuration) => {
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['~'] = path.resolve(__dirname);
        return config;
    }
};
