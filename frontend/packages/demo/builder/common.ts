import type {Worker} from './types';

const worker: Worker = async io => {
    await io.save<string[]>('/components');
};

export default worker;
