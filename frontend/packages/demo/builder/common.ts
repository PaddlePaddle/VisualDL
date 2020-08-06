import type {Worker} from './types';

const worker: Worker = async io => {
    await io.save<string[]>('/components');
    await io.save<string[]>('/runs');
};

export default worker;
