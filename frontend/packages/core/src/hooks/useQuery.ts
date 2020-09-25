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

import type {ParseOptions} from 'query-string';
import queryString from 'query-string';
import {useLocation} from 'react-router-dom';
import {useMemo} from 'react';

const useQuery = (options?: ParseOptions) => {
    const location = useLocation();
    const query = useMemo(() => queryString.parse(location.search, options), [location.search, options]);
    return query;
};

export default useQuery;
