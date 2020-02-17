import {Configuration} from 'webpack';

export default () => {
    return (config: Configuration): void => {
        config.module?.rules.push({
            test: /\.ya?ml$/,
            use: 'js-yaml-loader'
        });
    };
};
