module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: ['react', 'react-hooks', '@typescript-eslint'],
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off'
    }
};
