#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

import ora, {Ora} from 'ora';

import ecosystem from '@visualdl/server/ecosystem.config';
import pm2 from 'pm2';

const app = ecosystem.apps[0];

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('start', 'Start VisualDL server')
    .command('stop', 'Stop VisualDL server')
    .example(
        '$0 start --backend="http://172.17.0.82:8040"',
        'Start VisualDL server with backend address http://172.17.0.82:8040'
    )
    .alias('p', 'port')
    .nargs('p', 1)
    .nargs('port', 1)
    .describe('p', 'Port of server')
    .nargs('host', 1)
    .describe('host', 'Host of server')
    .alias('b', 'backend')
    .nargs('b', 1)
    .nargs('backend', 1)
    .describe('b', 'Backend API address')
    .boolean('demo')
    .describe('demo', 'Run in demo mode')
    .boolean('open')
    .describe('open', 'Open browser when server is ready')
    .help('h')
    .alias('h', 'help')
    .epilog('Visit https://github.com/PaddlePaddle/VisualDL for more information.').argv;

const command = argv._[0];

const exit = () => {
    console.log('Command not found, use -h or --help for help');
    process.exit(1);
};

const exitIfError = (err?: Error, exitCode = 1, spinner?: Ora) => {
    if (!err) {
        return;
    }
    if (spinner) {
        spinner.fail('Error!');
    }
    console.error(err);
    process.exit(exitCode);
};

if (!command) {
    exit();
}

const banner = `

█████   █████  ███                               ████  ██████████   █████
░░███   ░░███  ░░░                               ░░███ ░░███░░░░███ ░░███
 ░███    ░███  ████   █████  █████ ████  ██████   ░███  ░███   ░░███ ░███
 ░███    ░███ ░░███  ███░░  ░░███ ░███  ░░░░░███  ░███  ░███    ░███ ░███
 ░░███   ███   ░███ ░░█████  ░███ ░███   ███████  ░███  ░███    ░███ ░███
  ░░░█████░    ░███  ░░░░███ ░███ ░███  ███░░███  ░███  ░███    ███  ░███      █
    ░░███      █████ ██████  ░░████████░░████████ █████ ██████████   ███████████
     ░░░      ░░░░░ ░░░░░░    ░░░░░░░░  ░░░░░░░░ ░░░░░ ░░░░░░░░░░   ░░░░░░░░░░░



`;

pm2.connect(err => {
    exitIfError(err, 2);

    pm2.list((err, list) => {
        exitIfError(err, 2);

        const host = argv.host || 'localhost';
        const port = Number.parseInt(argv.port, 10) || 8999;
        const url = `http://${host}:${port}`;

        if (command === 'start') {
            if (list.find(item => item.name === app.name)) {
                exitIfError(new Error('VisualDL server is already running'), 1);
            }
            const spinner = ora('Starting VisualDL server...').start();
            pm2.start(
                {
                    ...app,
                    env: {
                        ...app.env,
                        HOST: host,
                        PORT: port + '',
                        BACKEND: argv.backend,
                        DEMO: argv.demo ? '1' : ''
                    }
                },
                err => {
                    pm2.disconnect();
                    exitIfError(err, 2, spinner);
                    spinner.succeed('Starting VisualDL server... Done');
                    console.log(banner);
                    console.log(`> VisualDL server is running at ${url}`);
                    if (argv.open) {
                        console.log('  Opening your browser for you...');
                        const open = require('open');
                        open(url);
                    }
                }
            );
        } else if (command === 'stop') {
            if (!list.find(item => item.name === app.name)) {
                exitIfError(new Error('VisualDL server is not running'), 1);
            }
            const spinner = ora('Stopping VisualDL server...').start();
            pm2.delete(app.name, err => {
                exitIfError(err, 2);
                const end = (err?: Error) => {
                    pm2.disconnect();
                    exitIfError(err, 2);

                    spinner.succeed('Stopping VisualDL server... Done');
                    console.log('> VisualDL server stopped');
                    console.log('  See you next time');
                    process.exit(0);
                };
                pm2.list((err, newList) => {
                    exitIfError(err, 2);
                    if (!newList.length) {
                        pm2.killDaemon(end);
                    } else {
                        end();
                    }
                });
            });
        } else {
            exit();
        }
    });
});
