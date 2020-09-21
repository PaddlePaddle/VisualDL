/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */

const path = require('path');
const fs = require('fs/promises');
const {BosClient} = require('@baiducloud/sdk');
const mime = require('mime-types');

const endpoint = process.env.BOS_ENDPOINT || 'https://bos.bj.baidubce.com';
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
                    mime: mime.contentType(path.extname(name)),
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

async function push(directory, options) {
    if (!ak || !sk) {
        console.error('No AK and SK specified!');
        process.exit(1);
    }

    let files = [];
    try {
        const stats = await fs.stat(directory);
        if (stats.isDirectory()) {
            files = (await getFiles(directory))
                .map(file => ({filename: path.relative(directory, file.name), ...file}))
                .filter(file => options?.exclude?.includes(file.filename) !== true);
        } else if (stats.isFile()) {
            files.push({
                filename: path.relative(path.basename(directory)),
                name: directory,
                mime: mime.contentType(path.extname(directory)),
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
                    'Content-Length': f.size,
                    'Content-Type': `${f.mime}`
                })
                .then(() => console.log([f.name, f.mime, f.size].join(', ')))
                .catch(error => console.error(f, error));
        })(file);
    }
}

module.exports = push;
