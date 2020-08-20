import type {Data, Worker} from './types';

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('histogram')) {
        return;
    }

    const {runs, tags} = await io.save<Data>('/histogram/tags');
    const q = [];
    for (const [index, run] of runs.entries()) {
        for (const tag of tags[index]) {
            q.push(io.save('/histogram/list', {run, tag}));
        }
    }
    await Promise.all(q);
};

export default worker;
