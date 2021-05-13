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

import Select from '~/components/Select';
import type {SelectProps} from '~/components/Select';
import {borderRadius} from '~/utils/style';
import styled from 'styled-components';

// forgive me, I don't want to write a type guard
const BorderLessSelect = styled<React.FunctionComponent<SelectProps<string>>>(Select)`
    border: none;
    line-height: 1.1;
    min-width: 4em;
    --height: 1em;
    --padding: 0;

    .list {
        border-radius: ${borderRadius};
    }
`;

export default BorderLessSelect;
