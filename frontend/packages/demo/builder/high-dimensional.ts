import type {Worker} from './types';

const worker: Worker = async io => {
    const components = await io.getData<string[]>('/components');
    if (!components.includes('embeddings')) {
        return;
    }

    // await io.save<Record<string, string[]>>('/embedding/embedding');
};

export default worker;
