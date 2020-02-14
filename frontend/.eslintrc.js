module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module' // Allows for the use of imports
    },
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier'
    ],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        indent: [
            'error',
            4,
            {
                SwitchCase: 1
            }
        ],
        semi: ['error', 'always'],
        'object-curly-spacing': ['error', 'never'],
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always'
            }
        ],
        'arrow-parens': ['error', 'as-needed']
    }
};
