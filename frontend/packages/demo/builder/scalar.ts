import type {Worker} from './types';

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('scalar')) {
        return;
    }

    const tagsMap = await io.save<Record<string, string[]>>('/scalar/tags');
    const q = [];
    for (const [run, tags] of Object.entries(tagsMap)) {
        for (const tag of tags) {
            q.push(io.save('/scalar/list', {run, tag}));
        }
    }
    await Promise.all(q);
};

export default worker;
