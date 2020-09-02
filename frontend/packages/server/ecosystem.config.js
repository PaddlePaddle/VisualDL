// cSpell:words autorestart
/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
    apps: [
        {
            name: 'visualdl',
            script: 'dist/index.js',
            cwd: __dirname,
            args: '',
            instances: 'max',
            autorestart: true,
            watch: false,
            exec_mode: 'cluster', // eslint-disable-line @typescript-eslint/naming-convention
            max_memory_restart: '2G', // eslint-disable-line @typescript-eslint/naming-convention
            wait_ready: true, // eslint-disable-line @typescript-eslint/naming-convention
            env: {
                ...process.env,
                NODE_ENV: 'production'
            }
        }
    ]
};
