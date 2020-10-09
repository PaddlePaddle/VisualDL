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

// cSpell:words autorestart
/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
    apps: [
        {
            name: 'visualdl',
            script: 'dist/index.js',
            cwd: __dirname,
            args: '',
            instances: 'max',
            autorestart: true,
            watch: false,
            exec_mode: 'cluster', // eslint-disable-line @typescript-eslint/naming-convention
            max_memory_restart: '2G', // eslint-disable-line @typescript-eslint/naming-convention
            wait_ready: true, // eslint-disable-line @typescript-eslint/naming-convention
            env: {
                ...process.env,
                NODE_ENV: 'production'
            }
        }
    ]
};
