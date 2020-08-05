import type {Worker} from './types';

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('pr_curve')) {
        return;
    }

    const tagsMap = await io.save<Record<string, string[]>>('/pr-curve/tags');
    for (const [run, tags] of Object.entries(tagsMap)) {
        await io.save('/pr-curve/steps', {run});
        for (const tag of tags) {
            await io.save('/pr-curve/list', {run, tag});
        }
    }
};

export default worker;
