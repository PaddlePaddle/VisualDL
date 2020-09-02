import * as funcs from '@visualdl/wasm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async <T extends (...args: any[]) => unknown>(name: keyof typeof funcs) => {
    return funcs[name] as T;
};
