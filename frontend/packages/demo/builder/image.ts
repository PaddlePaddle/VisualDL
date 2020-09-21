import type {Data, Worker} from './types';

interface Image {
    step: number;
    wallTime: number;
}

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('image')) {
        return;
    }

    const {runs, tags} = await io.save<Data>('/image/tags');
    for (const [index, run] of runs.entries()) {
        for (const tag of tags[index]) {
            const list = (await io.save<Image[]>('/image/list', {run, tag})) ?? [];
            for (const [index, image] of list.entries()) {
                await io.saveBinary('/image/image', {run, tag, index, ts: image.wallTime});
            }
        }
    }
};

export default worker;
