module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            jsx: true // Allows for the parsing of JSX
        }
    },
    extends: [
        'plugin:react/recommended',
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
        'arrow-parens': ['error', 'as-needed'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/display-name': 'off'
    },
    settings: {
        react: {
            createClass: 'createComponent',
            version: 'latest'
        },
        linkComponents: [
            {
                name: 'RouterLink',
                linkAttribute: 'to'
            },
            {
                name: 'NuxtLink',
                linkAttribute: 'to'
            }
        ]
    }
};
