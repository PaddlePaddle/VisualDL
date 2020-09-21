import type {Data, Worker} from './types';

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('pr_curve')) {
        return;
    }

    const {runs, tags} = await io.save<Data>('/pr-curve/tags');
    for (const [index, run] of runs.entries()) {
        await io.save('/pr-curve/steps', {run});
        for (const tag of tags[index]) {
            await io.save('/pr-curve/list', {run, tag});
        }
    }
};

export default worker;
