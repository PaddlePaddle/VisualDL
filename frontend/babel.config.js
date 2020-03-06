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
        ['emotion'],
        ...(process.env.NODE_ENV !== 'production' ? ['typescript-to-proptypes'] : [])
    ]
};
