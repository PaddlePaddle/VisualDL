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
const fs = require('fs/promises');
const {default: svgr} = require('@svgr/core');
const babel = require('@babel/core');
const {camelCase} = require('lodash');
const {ensureDir} = require('fs-extra');

const root = path.resolve(__dirname, '../public/icons');
const pathname = '/icons';
const dist = path.resolve(__dirname, '../dist');
const dest = path.join(dist, pathname);

async function transform(file, minified) {
    const basename = path.basename(file, '.svg');
    let jsx = await svgr(
        await fs.readFile(file, 'utf-8'),
        {
            icon: true,
            svgProps: {
                fill: 'currentColor',
                className: 'vdl-icon'
            }
        },
        {componentName: camelCase(basename).replace(/./, w => w.toUpperCase())}
    );
    jsx = jsx.replace('import * as React from "react";', 'import React from "../web_modules/react.js";');
    const result = await babel.transformAsync(jsx, {
        filename: basename + '.jsx',
        presets: ['@babel/preset-react'],
        minified
    });
    return result.code;
}

async function build() {
    await ensureDir(dest);
    const files = await fs.readdir(root);
    for (const file of files) {
        if (path.extname(file) === '.svg') {
            const js = await transform(path.join(root, file), false);
            await fs.writeFile(path.join(dest, path.basename(file, '.svg') + '.js'), js, 'utf-8');
        }
    }
    console.log('Icons copied!');
}

if (require.main === module) {
    build();
}

const middleware = () => {
    return async (req, res) => {
        const file = path.join(root, req.path.replace(/\.js$/, '.svg'));
        if ((await fs.stat(file)).isFile()) {
            res.type('js');
            res.send(await transform(file, false));
        }
    };
};

module.exports = {
    middleware,
    root,
    pathname
};
