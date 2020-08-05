import type IO from './io';

export type Worker = (io: IO) => Promise<void>;
