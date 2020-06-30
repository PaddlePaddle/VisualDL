import {useRef} from 'react';

export default function useCreation<T>(factory: () => T, deps: unknown[]) {
    const {current} = useRef({
        deps,
        obj: undefined as undefined | T,
        initialized: false
    });
    if (current.initialized === false || !depsAreSame(current.deps, deps)) {
        current.deps = deps;
        current.obj = factory();
        current.initialized = true;
    }
    return current.obj as T;
}

function depsAreSame(oldDeps: unknown[], deps: unknown[]): boolean {
    if (oldDeps === deps) return true;
    for (const i in oldDeps) {
        if (oldDeps[i] !== deps[i]) return false;
    }
    return true;
}
