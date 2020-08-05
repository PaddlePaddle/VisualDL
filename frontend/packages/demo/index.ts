import {Request, Response} from 'express';

import IO from './builder/io';
import meta from './data/meta.json';
import path from 'path';

function notFound(res: Response) {
    res.status(404).send({
        status: 1,
        msg: 'Not found'
    });
}

export default async (req: Request, res: Response) => {
    const method = req.path;

    if (!method) {
        return notFound(res);
    }

    const data = meta.find(item =>
        IO.isSameUri(item, {uri: method, query: req.query as Record<string, string | string[]>})
    );

    if (!data) {
        return notFound(res);
    }

    res.sendFile(path.join(__dirname, 'data/data', data.uri, data.filename), {
        headers: data.headers
    });
};
