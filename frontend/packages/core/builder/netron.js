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

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const fs = require('fs-extra');

const root = path.dirname(require('enhanced-resolve').sync(__dirname, '@visualdl/netron'));
const pathname = '/netron';
const dist = path.resolve(__dirname, '../dist');
const dest = path.join(dist, pathname);

async function build() {
    await fs.ensureDir(dest);
    await fs.copy(root, dest, {preserveTimestamps: true});
    console.log('Netron copied!');
}

if (require.main === module) {
    build();
}

module.exports = {
    root,
    dest,
    pathname
};
