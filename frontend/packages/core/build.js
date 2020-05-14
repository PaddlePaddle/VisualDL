/* eslint-disable no-console */

import ora from 'ora';
import path from 'path';
import {spawn} from 'child_process';
import {writeFileSync} from 'fs';

const next = require.resolve('next/dist/bin/next');
export const projectRoot = path.dirname(require.resolve('@visualdl/core'));

export default function (action, ...args) {
    return new Promise((resolve, reject) => {
        const capitalizedAction = action.replace(/^./, w => w.toUpperCase());

        const spinner = ora(`${capitalizedAction} in process...`).start();

        const log = path.join(process.cwd(), `${action}.log`);
        writeFileSync(log, '', {flag: 'w'});

        const p = spawn(next, [action, ...args], {
            cwd: projectRoot,
            env: {
                ...process.env,
                NODE_ENV: 'production'
            }
        });

        p.stdout.on('data', data => writeFileSync(log, data, {flag: 'a'}));
        p.stderr.on('data', data => writeFileSync(log, data, {flag: 'a'}));

        p.on('close', code => {
            if (code) {
                spinner.fail(`${capitalizedAction} failed!`);
                console.error(`Please refer to ${log} for more detail.`);
                reject(code);
            } else {
                spinner.succeed(`${capitalizedAction} complete!`);
                resolve(code);
            }
        });
    });
}
