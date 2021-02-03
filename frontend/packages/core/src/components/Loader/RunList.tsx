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

import React, {FunctionComponent} from 'react';

import ContentLoader from './ContentLoader';

const RunList: FunctionComponent<{count?: number}> = ({count}) => {
    return (
        <ContentLoader viewBox={`0 0 220 ${(count ?? 2) * 36}`}>
            {Array.from({length: count ?? 2}).map((_, i) => (
                <React.Fragment key={i}>
                    <rect x="0" y={`${11 * (i + 1) + 25 * i + 4.5}`} width="16" height="16" />
                    <circle cx="32" cy={`${11 * (i + 1) + 25 * i + 12.5}`} r="6" />
                    <rect x="46" y={`${11 * (i + 1) + 25 * i + 5.5}`} rx="3" ry="3" width="100" height="14" />
                </React.Fragment>
            ))}
        </ContentLoader>
    );
};

export default RunList;
