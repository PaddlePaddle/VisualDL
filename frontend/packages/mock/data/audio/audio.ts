import {Request, Response} from 'express';

import fs from 'fs/promises';
import mime from 'mime-types';
import path from 'path';

const audios = ['1.mp3', '2.wav', '3.mp3', '4.wav', '5.wav', '6.mp3', '7.wav'];

export default async (req: Request, res: Response) => {
    const index = (+req.query.index ?? 0) % audios.length;
    const file = path.resolve(__dirname, '../../assets/audio', audios[index]);
    const result = await fs.readFile(file);
    const contentType = mime.contentType(audios[index]);
    if (contentType) {
        res.setHeader('Content-Type', contentType);
    }
    return result;
};
