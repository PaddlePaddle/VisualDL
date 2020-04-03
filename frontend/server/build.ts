/* eslint-disable no-console */

import builder, {projectRoot} from '@visualdl/core/build';
import {cp, mkdir, rm} from 'shelljs';

import config from './webpack.config';
import path from 'path';
import webpack from 'webpack';

const dist = path.resolve(__dirname, 'dist');
console.log('Building server');
console.log(`Source: ${projectRoot}`);
console.log(`Destination: ${dist}`);

async function start() {
    try {
        await builder('build');
        rm('-rf', dist);
        mkdir('-p', dist);
        cp(
            '-Rf',
            ['dist', 'pages', 'public', 'next.config.js', 'package.json'].map(file => path.join(projectRoot, file)),
            dist
        );
    } catch (e) {
        process.exit(e);
    }
    console.log('Webpack building...');
    const compiler = webpack(config as webpack.Configuration);
    compiler.run(err => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
}

start();
