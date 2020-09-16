/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

require('dotenv').config();
require('./environment');

const path = require('path');
const {promises: fs} = require('fs');
const {BosClient} = require('@baiducloud/sdk');
const mime = require('mime-types');
const {minify} = require('html-minifier');

const endpoint = process.env.BOS_ENDPOINT || 'http://bj.bcebos.com';
const ak = process.env.BOS_AK;
const sk = process.env.BOS_SK;

const version = process.env.CDN_VERSION || 'latest';

const config = {
    endpoint,
    credentials: {
        ak,
        sk
    }
};

const bucket = 'visualdl-static';

const client = new BosClient(config);

async function getFiles(dir) {
    const result = [];
    try {
        const files = await fs.readdir(dir, {withFileTypes: true});
        for (const file of files) {
            if (file.isFile()) {
                const name = path.join(dir, file.name);
                result.push({
                    name,
                    mime: mime.lookup(name),
                    size: (await fs.stat(name)).size
                });
            } else if (file.isDirectory()) {
                result.push(...(await getFiles(path.join(dir, file.name))));
            }
        }
    } catch (e) {
        console.error(e);
    }
    return result;
}

async function pushCdn(directory) {
    if (!ak || !sk) {
        console.error('No AK and SK specified!');
        process.exit(1);
    }

    let files = [];
    try {
        const stats = await fs.stat(directory);
        if (stats.isDirectory()) {
            files = (await getFiles(directory)).map(file => ({filename: path.relative(directory, file.name), ...file}));
        } else if (stats.isFile()) {
            files.push({
                filename: path.relative(path.basename(directory)),
                name: directory,
                mime: mime.lookup(directory),
                size: stats.size
            });
        } else {
            console.error(`${directory} does not exist!`);
            process.exit(1);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
    for (const file of files) {
        (function (f) {
            client
                .putObjectFromFile(bucket, `assets/${version}/${f.filename}`, f.name, {
                    'content-length': f.size,
                    'content-type': `${f.mime}; charset=utf-8`
                })
                .then(() => console.log([f.name, f.mime, f.size].join(', ')))
                .catch(error => console.error(f, error));
        })(file);
    }
}

const dist = path.resolve(__dirname, '../dist');
const dest = path.join(dist, '__snowpack__');
const publicDir = path.resolve(__dirname, '../public');

function envProviderTemplate(baseUri) {
    return `
        <script type="module">
            import env from '${baseUri}/__snowpack__/env.local.js'; globalThis.env = env;
        </script>
    `;
}

const ENV_INJECT = 'const env = globalThis.env || {}; export default env;';
const ENV_PROVIDER = envProviderTemplate(process.env.SNOWPACK_PUBLIC_BASE_URI);
const ENV_TEMPLATE_PROVIDER = envProviderTemplate('%BASE_URI%');

async function injectProvider(input, provider, output) {
    const file = await fs.readFile(input, 'utf-8');
    const scriptPos = file.indexOf('<script ');
    const newFile = file.slice(0, scriptPos) + provider + file.slice(scriptPos);
    await fs.writeFile(
        output || input,
        minify(newFile, {
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            sortAttributes: true,
            sortClassName: true
        }),
        'utf-8'
    );
}

async function main() {
    await injectProvider(path.join(dist, 'index.html'), ENV_PROVIDER);
    await injectProvider(path.join(publicDir, 'index.html'), ENV_TEMPLATE_PROVIDER, path.join(dist, 'index.tpl.html'));

    const envFile = path.join(dest, 'env.js');
    await fs.rename(envFile, path.join(dest, 'env.local.js'));
    await fs.writeFile(envFile, ENV_INJECT, 'utf-8');

    if (process.env.CDN_VERSION) {
        // TODO: do not upload index.html & index.tpl.html & __snowpack__/env.local.js
        await pushCdn(dist);
    }
}

main();
