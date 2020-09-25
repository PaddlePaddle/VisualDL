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

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const fs = require('fs/promises');

const ENV_INJECT = 'const env = window.__snowpack_env__ || {}; export default env;';

const dest = path.resolve(__dirname, '../dist/__snowpack__');
const envFile = path.join(dest, 'env.js');

module.exports = async () => {
    await fs.rename(envFile, path.join(dest, 'env.local.js'));
    await fs.writeFile(envFile, ENV_INJECT, 'utf-8');
};
