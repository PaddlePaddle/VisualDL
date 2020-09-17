/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const fs = require('fs/promises');

const ENV_INJECT = 'const env = window.__snowpack_env__ || {}; export default env;';

const dest = path.resolve(__dirname, '../dist/__snowpack__');
const envFile = path.join(dest, 'env.js');

module.exports = async () => {
    await fs.rename(envFile, path.join(dest, 'env.local.js'));
    await fs.writeFile(envFile, ENV_INJECT, 'utf-8');
};
