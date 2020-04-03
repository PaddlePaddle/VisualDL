/* eslint-disable no-console */

import builder, {projectRoot} from '@visualdl/core/build';

import path from 'path';
import rimraf from 'rimraf';

const dist = path.join(__dirname, 'dist');
console.log('Building serverless');
console.log(`Source: ${projectRoot}`);
console.log(`Destination: ${dist}`);

function clean(): Promise<void> {
    return new Promise((resolve, reject) => {
        rimraf(dist, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function start() {
    try {
        await clean();
        await builder('build');
        await builder('export', '-o', dist);
    } catch (e) {
        process.exit(e);
    }
    process.exit(0);
}

start();
