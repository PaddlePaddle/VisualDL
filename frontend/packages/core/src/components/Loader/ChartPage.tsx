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

export const Chart: FunctionComponent<{width: number; height: number}> = ({width, height}) => {
    return (
        <ContentLoader viewBox={`0 0 ${width} ${height}`}>
            <rect x="20" y="20" rx="3" ry="3" width="200" height="16" />
            <rect x="20" y="56" rx="3" ry="3" width="390" height="231" />
            <rect x="20" y="301" rx="3" ry="3" width="16" height="16" />
            <rect x="52" y="301" rx="3" ry="3" width="16" height="16" />
        </ContentLoader>
    );
};

export const SampleChart: FunctionComponent<{width: number; height: number}> = ({width, height}) => {
    return (
        <ContentLoader viewBox={`0 0 ${width} ${height}`}>
            <rect x="20" y="20" rx="3" ry="3" width="200" height="18" />
            <rect x="333" y="26.5" rx="2.5" ry="2.5" width="17" height="5" />
            <rect x="358" y="22" rx="3" ry="3" width="50" height="14" />
            <rect x="20" y="61" rx="3" ry="3" width="50" height="12" />
            <rect x="298" y="61" rx="3" ry="3" width="110" height="12" />
            <rect x="20" y="84" rx="2" ry="2" width="388" height="4" />
            <circle cx="20" cy="86" r="6" />
            <rect x="20" y="116" rx="3" ry="3" width="388" height={`${height - 170}`} />
            <rect x="20" y={`${height - 34}`} rx="3" ry="3" width="16" height="16" />
            <rect x="20" y={`${height - 34}`} rx="3" ry="3" width="16" height="16" />
            <rect x="52" y={`${height - 34}`} rx="3" ry="3" width="16" height="16" />
            <rect x="358" y={`${height - 32}`} rx="3" ry="3" width="50" height="12" />
        </ContentLoader>
    );
};

export const TextChart: FunctionComponent<{width: number}> = ({width}) => {
    return (
        <ContentLoader viewBox="0 0 1098 38" height={38}>
            <rect x="8" y="6" rx="4" ry="4" width="64" height="26" />
            <rect x="86" y="11" rx="3" ry="3" width={width} height="16" />
        </ContentLoader>
    );
};

export const ChartCollapseTitle: FunctionComponent = () => {
    return (
        <ContentLoader viewBox="0 0 200 18" width={200} height={18}>
            <rect x="0" y="0" rx="3" ry="3" width="200" height="18" />
        </ContentLoader>
    );
};
