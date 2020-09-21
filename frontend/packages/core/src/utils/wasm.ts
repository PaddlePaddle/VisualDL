import * as funcs from '@visualdl/wasm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async <T extends (...args: any[]) => unknown>(name: Exclude<keyof typeof funcs, 'default'>) => {
    return funcs[name] as T;
};
