module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: ['plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    ignorePatterns: ['node_modules/', 'dist/', 'output/'],
    rules: {
        'no-console': 'warn',
        'sort-imports': 'error'
    },
    overrides: [
        {
            files: ['packages/cli/**/*', 'packages/mock/**/*', 'packages/demo/**/*', 'packages/server/**/*'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'prettier/@typescript-eslint',
                'plugin:prettier/recommended'
            ],
            parser: '@typescript-eslint/parser',
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-explicit-any': 'error'
            }
        },
        {
            files: ['packages/core/**/*'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:react/recommended',
                'plugin:react-hooks/recommended',
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
            settings: {
                react: {
                    version: 'detect'
                }
            },
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-explicit-any': 'error',
                'react/prop-types': 'off',
                'react/react-in-jsx-scope': 'off'
            }
        }
    ]
};
