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

// cspell:words svgs multipass

import {ensureDir, remove} from 'fs-extra';

import babel from '@babel/core';
import camelCase from 'camelcase';
import {fileURLToPath} from 'url';
import fs from 'fs/promises';
import path from 'path';
import {optimize as svgo} from 'svgo';
import svgr from '@svgr/core';

const cwd = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(cwd, './icons');
const components = path.resolve(cwd, './components');
const svgs = path.resolve(cwd, './svgs');

async function transform(file, minified = false) {
    const basename = path.basename(file, '.svg');
    const jsx = await svgr.default(
        await fs.readFile(file, 'utf-8'),
        {
            plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
            icon: true,
            svgProps: {
                fill: 'currentColor',
                className: 'vdl-icon'
            }
        },
        {componentName: camelCase(basename).replace(/./, w => w.toUpperCase())}
    );
    const result = await babel.transformAsync(jsx, {
        filename: basename + '.jsx',
        presets: ['@babel/preset-react'],
        minified
    });
    return result.code;
}

async function optimize(file) {
    const result = svgo(await fs.readFile(file, 'utf-8'), {
        multipass: true
    });
    return result.data;
}

async function build() {
    await remove(components);
    await ensureDir(components);
    await remove(svgs);
    await ensureDir(svgs);
    const files = await fs.readdir(src);
    for (const file of files) {
        if (path.extname(file) === '.svg') {
            const filePath = path.join(src, file);
            const js = await transform(filePath, true);
            await fs.writeFile(path.join(components, path.basename(file, '.svg') + '.js'), js, 'utf-8');
            const svg = await optimize(filePath);
            await fs.writeFile(path.join(svgs, file), svg, 'utf-8');
        }
    }
}

build();
