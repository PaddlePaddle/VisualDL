import type {Data, Worker} from './types';

interface Audio {
    step: number;
    wallTime: number;
}

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('audio')) {
        return;
    }

    const {runs, tags} = await io.save<Data>('/audio/tags');
    for (const [index, run] of runs.entries()) {
        for (const tag of tags[index]) {
            const list = (await io.save<Audio[]>('/audio/list', {run, tag})) ?? [];
            for (const [index, audio] of list.entries()) {
                await io.saveBinary('/audio/audio', {run, tag, index, ts: audio.wallTime});
            }
        }
    }
};

export default worker;
