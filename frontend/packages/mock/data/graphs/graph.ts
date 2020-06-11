import {Request, Response} from 'express';

import fetch from 'isomorphic-unfetch';

const model = 'https://gitee.com/public_sharing/ObjectDetection-YOLO/raw/master/yolov3.cfg';

export default async (req: Request, res: Response) => {
    const result = await fetch(model);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="yolov3.cfg"');
    return result.arrayBuffer();
};
