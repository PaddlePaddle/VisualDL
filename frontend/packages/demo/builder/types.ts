import type IO from './io';

export type Worker = (io: IO) => Promise<void>;

export type Data = {
    runs: string[];
    tags: string[][];
};
