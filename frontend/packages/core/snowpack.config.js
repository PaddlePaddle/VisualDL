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

// cspell:words pnpify svgs entrypoints

import * as env from './builder/env.js';

import {fileURLToPath} from 'url';
import fs from 'fs';
import path from 'path';
import resolve from 'enhanced-resolve';

const cwd = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(cwd, '../../');

function isWorkspace() {
    try {
        const packageJson = fs.readFileSync(path.resolve(workspaceRoot, './package.json'), 'utf-8');
        return !!JSON.parse(packageJson).workspaces;
    } catch {
        return false;
    }
}

const iconsPath = path.dirname(resolve.sync(cwd, '@visualdl/icons'));
const netronPath = path.dirname(resolve.sync(cwd, '@visualdl/netron'));
const TracePath = path.dirname(resolve.sync(cwd, './public/static'));
const wasmPath = path.dirname(resolve.sync(cwd, '@visualdl/wasm'));
const dest = path.resolve(cwd, './dist/__snowpack__/link/packages');

/** @type {import("snowpack").SnowpackUserConfig } */
export default {
    cwd,
    workspaceRoot: isWorkspace() ? workspaceRoot : undefined,
    mount: {
        src: '/_dist_',
        public: {
            url: '/',
            static: true
        }
    },
    routes: [
        {
            match: 'routes',
            src: '.*',
            dest: '/index.html'
        }
    ],
    env,
    alias: {
        '~': './src'
    },
    plugins: [
        '@snowpack/plugin-react-refresh',
        '@snowpack/plugin-dotenv',
        'snowpack-plugin-less',
        '@snowpack/plugin-sass',
        [
            '@snowpack/plugin-typescript',
            {
                /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
                ...(process.versions.pnp ? {tsc: 'yarn pnpify tsc'} : {})
            }
        ],
        [
            '@snowpack/plugin-optimize',
            {
                minifyHTML: false,
                preloadModules: true,
                preloadCSS: true,
                target: ['chrome79', 'firefox67', 'safari11.1', 'edge79']
            }
        ],
        [
            'snowpack-plugin-copy',
            {
                patterns: [
                    {
                        source: ['components/*.js', 'svgs/*.svg'],
                        destination: path.join(dest, 'icons'),
                        options: {
                            cwd: iconsPath,
                            parents: true
                        }
                    },
                    {
                        source: [path.join(netronPath, '**/*')],
                        destination: path.join(dest, 'netron/dist')
                    },
                    {
                        source: [path.join(TracePath, '**/*')],
                        destination: path.join(dest, 'trace/dist')
                    },
                    {
                        source: [path.join(wasmPath, '*.{js,wasm}')],
                        destination: path.join(dest, 'wasm/dist')
                    }
                ]
            }
        ]
    ],
    devOptions: {
        hostname: process.env.HOST || 'localhost',
        port: Number.parseInt(process.env.PORT || 3000, 10)
    },
    packageOptions: {
        polyfillNode: true,
        // knownEntrypoints: ['chai', '@testing-library/react', 'fetch-mock/esm/client', 'react-is','rc-util/es/hooks/useId','rc-util/es/Portal','rc-util/es/Dom/contains','rc-util/es/Dom/css','rc-util/es/getScrollBarSize','rc-util/es/PortalWrapper','rc-select/es/hooks/useId','rc-util/es/Dom/isVisible','rc-util/es/Dom/focus','rc-util/es/Dom/focus']
        knownEntrypoints: ['chai', '@testing-library/react', 'fetch-mock/esm/client', 'react-is', 'antd']
    },
    buildOptions: {
        out: 'dist',
        baseUrl: '/',
        clean: true,
        metaUrlPath: '__snowpack__'
    }
};
