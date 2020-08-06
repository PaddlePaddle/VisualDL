import type {Worker} from './types';

const worker: Worker = async io => {
    await io.saveBinary('/graph/graph');
};

export default worker;
