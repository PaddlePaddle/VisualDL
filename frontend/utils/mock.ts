import path from 'path';
import faker from 'faker';
import {Request, Response} from 'express';

const sleep = (time: number) => {
    return new Promise(resolve => setTimeout(resolve, time));
};

export type Options = {
    path: string;
    delay?: number | ((method: string) => number);
};

export default (options: Options) => {
    return async (req: Request, res: Response) => {
        const method = req.path.replace(/^\//, '');

        if (!method) {
            res.status(404).send({});
            return;
        }

        try {
            let {default: mock} = await import(path.resolve(options.path, method));

            if ('function' === typeof mock) {
                mock = await mock(req, res);
            }

            // sleep
            let delay = 0;
            if ('function' === typeof options.delay) {
                delay = options.delay(method);
            } else if (options.delay) {
                delay = options.delay;
            }
            await sleep(delay);

            if (mock instanceof ArrayBuffer) {
                res.send(Buffer.from(mock));
            } else {
                res.json(JSON.parse(faker.fake(JSON.stringify(mock, null, 4))));
            }
        } catch (e) {
            res.status(500).send(e.message);
        }
    };
};
