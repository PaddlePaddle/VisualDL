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

const path = require('path');
const fs = require('fs');

const getPackages = filenames =>
    [
        ...new Set(
            filenames.map(filename => path.relative(path.join(__dirname, 'packages'), filename).split(path.sep)[0])
        )
    ].filter(p => p !== '..');

module.exports = {
    // lint all files when global package.json or eslint config changes.
    './(package.json|.eslintrc.js)': () =>
        `eslint --ext .tsx,.jsx.ts,.js --ignore-path ${path.join(__dirname, '.gitignore')} ${__dirname}`,

    // check types when ts file or package.json changes.
    './(packages/*/package.json|packages/*/**/*.ts?(x))': filenames =>
        getPackages(filenames)
            .map(p => path.join(__dirname, 'packages', p, 'tsconfig.json'))
            .filter(p => {
                try {
                    return fs.statSync(p).isFile();
                } catch (e) {
                    return false;
                }
            })
            .map(p => `tsc -p ${p} --noEmit`),

    // lint changed files
    '**/*.(j|t)s?(x)': filenames => [
        `eslint ${filenames.join(' ')}`,
        ...getPackages(filenames).map(p => {
            const filename = path.join(__dirname, 'packages', p, 'package.json');
            const packageFile = JSON.parse(fs.readFileSync(filename, 'utf-8'));
            if (packageFile.scripts.test.startsWith('jest')) {
                return `yarn workspace @visualdl/${p} run test --silent --bail --findRelatedTests ${filenames.join(
                    ' '
                )}`;
            }
            return `yarn workspace @visualdl/${p} run test`;
        })
    ]
};
