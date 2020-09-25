/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
