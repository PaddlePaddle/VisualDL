import {Request, Response} from 'express';

import fs from 'fs/promises';
import mime from 'mime-types';
import path from 'path';

const images = ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.gif', '6.gif', '7.gif'];

export default async (req: Request, res: Response) => {
    const index = (+req.query.index ?? 0) % images.length;
    const file = path.resolve(__dirname, '../../assets/image', images[index]);
    const result = await fs.readFile(file);
    const contentType = mime.contentType(images[index]);
    if (contentType) {
        res.setHeader('Content-Type', contentType);
    }
    return result;
};
