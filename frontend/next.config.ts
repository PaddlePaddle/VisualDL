import path from 'path';
import {Configuration} from 'webpack';
import pkg from './package.json';

const APP = {
    name: pkg.name,
    version: pkg.version,
    title: pkg.title,
    description: pkg.description,
    author: pkg.author,
    keywords: pkg.keywords.join(',')
};

export default {
    env: {
        ...APP
    },
    webpack: (config: Configuration) => {
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['~'] = path.resolve(__dirname);
        return config;
    }
};
