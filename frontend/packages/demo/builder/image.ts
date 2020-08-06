import type {Worker} from './types';

interface Image {
    step: number;
    wallTime: number;
}

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('image')) {
        return;
    }

    const tagsMap = await io.save<Record<string, string[]>>('/image/tags');
    for (const [run, tags] of Object.entries(tagsMap)) {
        for (const tag of tags) {
            const list = await io.save<Image[]>('/image/list', {run, tag});
            for (const [index, image] of Object.entries(list)) {
                await io.saveBinary('/image/image', {run, tag, index, ts: image.wallTime});
            }
        }
    }
};

export default worker;
