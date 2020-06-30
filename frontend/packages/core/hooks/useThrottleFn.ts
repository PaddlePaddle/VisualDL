/* eslint-disable @typescript-eslint/no-explicit-any */
import throttle from 'lodash/throttle';
import useCreation from '~/hooks/useCreation';
import {useRef} from 'react';

export interface ThrottleOptions {
    wait?: number;
    leading?: boolean;
    trailing?: boolean;
}

type Fn = (...args: any[]) => any;

interface ReturnValue<T extends Fn> {
    run: T;
    cancel: () => void;
}

function useThrottleFn<T extends Fn>(fn: T, options?: ThrottleOptions): ReturnValue<T> {
    const fnRef = useRef<Fn>(fn);
    fnRef.current = fn;

    const wait = options?.wait ?? 1000;

    const throttled = useCreation(
        () =>
            throttle(
                (...args: any[]) => {
                    fnRef.current(...args);
                },
                wait,
                options
            ),
        []
    );

    return {
        run: (throttled as any) as T,
        cancel: throttled.cancel
    };
}

export default useThrottleFn;
