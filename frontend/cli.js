#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('start', 'Start VisualDL server')
    .command('stop', 'Stop VisualDL server')
    .example('$0 start --host 192.168.0.2 --port 3000', 'Start VisualDL server at http://192.168.0.2:3000')
    .alias('p', 'port')
    .nargs('p', 1)
    .nargs('port', 1)
    .describe('p', 'Port of server')
    .nargs('host', 1)
    .describe('host', 'Host of server')
    .nargs('proxy', 1)
    .describe('proxy', 'Backend proxy address')
    .boolean('open')
    .describe('open', 'Open browser when server is ready')
    .help('h')
    .alias('h', 'help')
    .epilog('Visit https://github.com/PaddlePaddle/VisualDL for more infomation.').argv;

const command = argv._[0];

const exit = () => {
    console.log('Command not found, use -h or --help for help');
    process.exit(1);
};

const exitIfError = (err, exitCode = 1, spinner) => {
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

const pm2 = require('pm2');
pm2.connect(err => {
    exitIfError(err, 2);

    pm2.list((err, list) => {
        exitIfError(err, 2);

        const ecosystem = require('./ecosystem.config');

        const app = ecosystem.apps[0];
        const host = argv.host || 'localhost';
        const port = Number.parseInt(argv.port, 10) || 8999;
        const url = `http://${host}:${port}`;

        const ora = require('ora');

        if (command === 'start') {
            if (list.find(item => item.name === app.name)) {
                exitIfError('VisualDL server is already running', 1);
            }
            const spinner = ora('Starting VisualDL server...').start();
            pm2.start(
                {
                    ...app,
                    env: {
                        NODE_ENV: 'production',
                        HOST: host,
                        PORT: port,
                        PROXY: argv.proxy
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
                exitIfError('VisualDL server is not running', 1);
            }
            const spinner = ora('Stopping VisualDL server...').start();
            pm2.delete(app.name, err => {
                exitIfError(err, 2);
                const end = err => {
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
