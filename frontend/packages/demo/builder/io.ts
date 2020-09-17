/* eslint-disable no-console */

import crypto, {BinaryLike} from 'crypto';
import {promises as fs, writeFileSync} from 'fs';

import path from 'path';
import querystring from 'querystring';

const apiUrl = '/api';

type Query = Record<string, string | number> | null;

interface WriteOptions {
    type?: 'json' | 'buffer';
}

interface MetaData {
    uri: string;
    query?: Record<string, string | string[]>;
    filename: string;
    headers: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ResponseData<T = any> {
    status: number;
    msg?: string;
    data: T;
}

function isEmpty(obj: Record<string, unknown> | null | undefined) {
    if (obj == null) {
        return true;
    }
    return !Object.keys(obj).length;
}

export default class IO {
    public static readonly metaFileName = 'meta.json';
    public static readonly dataPath = 'data';
    public static readonly hashFunction = 'md4';

    protected readonly url: string;
    protected readonly dataDir: string;

    protected metadata: MetaData[] = [];

    constructor(url: string, dataDir: string) {
        this.url = url;
        this.dataDir = dataDir;

        writeFileSync(path.join(this.dataDir, IO.metaFileName), JSON.stringify(this.metadata), {
            encoding: 'utf-8',
            flag: 'w'
        });
    }

    public static isSameUri(url1: Pick<MetaData, 'uri' | 'query'>, url2: Pick<MetaData, 'uri' | 'query'>) {
        if (url1.uri !== url2.uri) {
            return false;
        }
        if (!isEmpty(url2.query)) {
            if (isEmpty(url1.query)) {
                return false;
            }
            for (const [key, value] of Object.entries(url2.query)) {
                const existValue = url1.query[key];
                if (existValue !== value) {
                    if (Array.isArray(value) && Array.isArray(existValue)) {
                        const count = value.reduce<Record<string, number>>((m, v) => {
                            if (m[v] == null) {
                                m[v] = 1;
                            } else {
                                m[v]++;
                            }
                            return m;
                        }, {});
                        for (const i of existValue) {
                            if (count[i] == null) {
                                return false;
                            }
                            count[i]--;
                        }
                        return Object.values(count).every(c => c === 0);
                    }
                    return false;
                }
            }
            return true;
        } else {
            return isEmpty(url1.query);
        }
    }

    private generateFilename(content: BinaryLike) {
        const hash = crypto.createHash(IO.hashFunction);
        hash.update(content);
        return hash.digest('hex');
    }

    private addMeta(meta: MetaData) {
        const exist = this.metadata.find(data => IO.isSameUri(data, meta));
        if (!exist) {
            this.metadata.push(meta);
        }
    }

    protected async write(
        filePath: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: Record<string, any> | Buffer,
        contentType: string,
        options?: WriteOptions | WriteOptions['type']
    ) {
        const {default: mkdirp} = await import('mkdirp');
        const type = 'string' === typeof options ? options : options?.type ?? 'json';

        const fileDir = path.join(this.dataDir, IO.dataPath, filePath);
        await mkdirp(fileDir);
        let fileContent: Buffer;
        let extname: string;
        if (type === 'buffer') {
            const {default: mime} = await import('mime-types');
            extname = mime.extension(contentType) || '';
            if (extname) {
                extname = '.' + extname;
            }
            fileContent = content as Buffer;
        } else {
            extname = '.json';
            fileContent = Buffer.from(JSON.stringify(content), 'utf-8');
        }

        const filename = this.generateFilename(fileContent) + extname;
        await fs.writeFile(path.join(fileDir, filename), fileContent, {
            encoding: null,
            flag: 'w'
        });
        console.log(`write file ${path.join(filePath, filename)}`);
        return filename;
    }

    async fetch(uri: string, query?: Query) {
        const {default: fetch} = await import('node-fetch');
        let url = this.url + apiUrl + uri;
        if (!isEmpty(query)) {
            url += '?' + querystring.stringify(query);
        }
        try {
            return await fetch(url);
        } catch (e) {
            console.error(e);
        }
    }

    protected async fetchAndWrite<T>(uri: string, query?: Query, options?: WriteOptions | WriteOptions['type']) {
        const type = 'string' === typeof options ? options : options?.type ?? 'json';

        const response = await this.fetch(uri, query);
        if (!response.ok) {
            throw new Error('not ok');
        }

        let content: ResponseData<T> | ArrayBuffer;
        if (type === 'buffer') {
            content = await response.buffer();
        } else {
            content = (await response.json()) as ResponseData<T>;
        }
        const filename = await this.write(uri, content, response.headers.get('content-type'), options);
        this.addMeta({
            uri,
            query: isEmpty(query) ? undefined : querystring.parse(querystring.stringify(query)),
            filename,
            headers: ['Content-Type', 'Content-Disposition'].reduce((m, t) => {
                m[t] = response.headers.get(t) || undefined;
                return m;
            }, {})
        });
        return content;
    }

    async save<T>(uri: string, query?: Query) {
        return ((await this.fetchAndWrite<T>(uri, query, 'json')) as ResponseData<T>).data;
    }

    async saveBinary(uri: string, query?: Query) {
        return (await this.fetchAndWrite(uri, query, 'buffer')) as Buffer;
    }

    async getData<T>(uri: string, query?: Query) {
        return ((await (await this.fetch(uri, query)).json()) as ResponseData<T>).data;
    }

    generateMeta() {
        return fs.writeFile(path.join(this.dataDir, IO.metaFileName), JSON.stringify(this.metadata), {
            encoding: 'utf-8',
            flag: 'w'
        });
    }

    sleep(time: number) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }
}
