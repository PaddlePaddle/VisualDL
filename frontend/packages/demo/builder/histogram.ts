import type {Worker} from './types';

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('histogram')) {
        return;
    }

    const tagsMap = await io.save<Record<string, string[]>>('/histogram/tags');
    const q = [];
    for (const [run, tags] of Object.entries(tagsMap)) {
        for (const tag of tags) {
            q.push(io.save('/histogram/list', {run, tag}));
        }
    }
    await Promise.all(q);
};

export default worker;
