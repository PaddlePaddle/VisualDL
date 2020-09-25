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

import useDebounce from '~/hooks/useDebounce';

const isEmptyValue = (value: unknown): boolean =>
    (Array.isArray(value) && !value.length) || ('string' === typeof value && value === '');

const useSearchValue = <T>(value: T, delay = 275): T => {
    const debounced = useDebounce(value, delay);
    // return empty value immediately
    if (isEmptyValue(value)) {
        return value;
    }
    // if debounced value is empty, return non-empty value immediately
    if (isEmptyValue(debounced)) {
        return value;
    }
    return debounced;
};

export default useSearchValue;
