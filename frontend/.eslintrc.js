/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: ['plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    plugins: ['license-header'],
    rules: {
        // 'sort-imports': 'warn',
        // 'no-console': 'warn'
        // 'license-header/header': ['error', './license-header.js']
    },
    overrides: [
        {
            files: ['packages/cli/**/*', 'packages/demo/**/*', 'packages/server/**/*'],
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
            parser: '@typescript-eslint/parser',
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-explicit-any': 'off'
            }
        },
        {
            files: ['packages/core/**/*'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:react/recommended',
                'plugin:react-hooks/recommended',
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
                '@typescript-eslint/no-explicit-any': 'off',
                'react/prop-types': 'off',
                'react/react-in-jsx-scope': 'off'
            }
        },
        {
            files: ['packages/icons/**/*']
        }
    ]
};
