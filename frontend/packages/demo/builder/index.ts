/* eslint-disable no-console */

import IO from './io';
import {SIGINT} from 'constants';
import type {Worker} from './types';
import getPort from 'get-port';
import mkdirp from 'mkdirp';
import path from 'path';
import rimraf from 'rimraf';
import {spawn} from 'child_process';

const host = '127.0.0.1';
const publicPath = '/visualdl';
const pages = ['common', 'scalar', 'histogram', 'image', 'audio', 'graph', 'pr-curve', 'high-dimensional'];
const dataDir = path.resolve(__dirname, '../data');

async function start() {
    rimraf.sync(dataDir);

    const port = await getPort({host});

    mkdirp.sync(dataDir);

    const io = new IO(`http://${host}:${port}${publicPath}`, dataDir);

    const p = spawn(
        'visualdl',
        [
            '--logdir',
            '.',
            '--model',
            './__model__',
            '--host',
            host,
            '--port',
            String(port),
            '--public-path',
            publicPath
        ],
        {
            cwd: path.resolve(__dirname, '../logs'),
            stdio: ['ignore', 'pipe', 'pipe']
        }
    );

    p.on('error', err => console.error(err));

    const stop = () => {
        if (!p.killed) {
            p.kill(SIGINT);
        }
    };

    const check = async (data: Buffer) => {
        const message = data.toString();
        if (message.startsWith('Running VisualDL')) {
            p.stdout.off('data', check);
            p.stderr.off('data', check);
            await Promise.all(
                pages.map(
                    page =>
                        new Promise((resolve, reject) => {
                            import(`./${page}`)
                                .then(data => data.default)
                                .then((worker: Worker) => worker(io).then(resolve))
                                .catch(reject);
                        })
                )
            );
            await io.generateMeta();
            stop();
        }
    };

    p.stdout.on('data', check);
    p.stderr.on('data', check);

    process.on('exit', stop);
}

start();
