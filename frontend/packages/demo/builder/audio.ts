import type {Worker} from './types';

interface Audio {
    step: number;
    wallTime: number;
}

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('audio')) {
        return;
    }

    const tagsMap = await io.save<Record<string, string[]>>('/audio/tags');
    for (const [run, tags] of Object.entries(tagsMap)) {
        for (const tag of tags) {
            const list = await io.save<Audio[]>('/audio/list', {run, tag});
            for (const [index, audio] of Object.entries(list)) {
                await io.saveBinary('/audio/audio', {run, tag, index, ts: audio.wallTime});
            }
        }
    }
};

export default worker;
