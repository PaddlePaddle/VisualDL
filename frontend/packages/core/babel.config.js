module.exports = {
    extends: '@snowpack/app-scripts-react/babel.config.json',
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    esmodules: true
                },
                bugfixes: true,
                modules: false
            }
        ]
    ],
    plugins: ['styled-components', '@babel/plugin-proposal-class-properties']
};
