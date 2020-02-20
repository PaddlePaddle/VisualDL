module.exports = {
    presets: ['next/babel'],
    plugins: [
        [
            'styled-components',
            {
                ssr: true,
                displayName: true,
                preprocess: false
            }
        ],
        ...(process.env.NODE_ENV !== 'production' ? ['babel-plugin-typescript-to-proptypes'] : [])
    ]
};
