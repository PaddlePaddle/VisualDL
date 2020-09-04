/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const fs = require('fs-extra');

const root = path.dirname(require('enhanced-resolve').sync(__dirname, '@visualdl/wasm'));
const source = path.join(root, 'index_bg.wasm');
const dist = path.resolve(__dirname, '../dist');
const pathname = '/wasm';
const out = 'visualdl.wasm';
const dest = path.join(dist, pathname, out);

async function build() {
    await fs.ensureDir(path.join(dist, pathname));
    await fs.copy(source, dest, {preserveTimestamps: true});
    console.log('WebAssembly copied!');
}

if (require.main === module) {
    build();
}

module.exports = {
    dest,
    source,
    pathname,
    out
};
