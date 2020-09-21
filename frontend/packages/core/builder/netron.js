/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const fs = require('fs-extra');

const root = path.dirname(require('enhanced-resolve').sync(__dirname, '@visualdl/netron'));
const pathname = '/netron';
const dist = path.resolve(__dirname, '../dist');
const dest = path.join(dist, pathname);

async function build() {
    await fs.ensureDir(dest);
    await fs.copy(root, dest, {preserveTimestamps: true});
    console.log('Netron copied!');
}

if (require.main === module) {
    build();
}

module.exports = {
    root,
    dest,
    pathname
};
