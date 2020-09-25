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

import {useCallback, useEffect, useRef} from 'react';

const useClickOutside = <T extends HTMLElement>(callback: () => void) => {
    const ref = useRef<T | null>(null);

    const escapeListener = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                callback();
            }
        },
        [callback]
    );
    const clickListener = useCallback(
        (e: MouseEvent | TouchEvent) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (ref.current && !(ref.current! as Node).contains(e.target as Node)) {
                callback();
            }
        },
        [callback]
    );

    useEffect(() => {
        document.addEventListener('mousedown', clickListener);
        document.addEventListener('touchstart', clickListener);
        document.addEventListener('keyup', escapeListener);
        return () => {
            document.removeEventListener('mousedown', clickListener);
            document.removeEventListener('touchstart', clickListener);
            document.removeEventListener('keyup', escapeListener);
        };
    }, [clickListener, escapeListener]);

    return ref;
};

export default useClickOutside;
