/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const ora = require('ora');
const path = require('path');
const {spawn} = require('child_process');
const {writeFileSync} = require('fs');

const next = require.resolve('next/dist/bin/next');
const projectRoot = path.dirname(require.resolve('@visualdl/core'));

module.exports = function (action, ...args) {
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
};

module.exports.projectRoot = projectRoot;
