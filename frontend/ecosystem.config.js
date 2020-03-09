/* eslint-disable @typescript-eslint/no-var-requires */

const {resolve} = require('app-root-path');

module.exports = {
    apps: [
        {
            name: 'visualdl',
            script: 'dist/server/index.js',
            cwd: resolve('/'),
            args: '',
            instances: 'max',
            autorestart: true,
            watch: false,
            exec_mode: 'cluster', // eslint-disable-line @typescript-eslint/camelcase
            max_memory_restart: '2G', // eslint-disable-line @typescript-eslint/camelcase
            wait_ready: true, // eslint-disable-line @typescript-eslint/camelcase
            env: {
                ...process.env,
                NODE_ENV: 'production'
            }
        }
    ]
};
