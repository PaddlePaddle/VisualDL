import path from 'path';
import {Configuration} from 'webpack';

export default {
    webpack: (config: Configuration) => {
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['~'] = path.resolve(__dirname);
        return config;
    }
};
