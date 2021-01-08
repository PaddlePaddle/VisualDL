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

import ContentLoader from '../ContentLoader';

const StepSlider: FunctionComponent = () => {
    return (
        <ContentLoader viewBox="0 0 220 67">
            <circle cx="6" cy="9.5" r="6" />
            <rect x="20" y="2.5" width="50" height="14" />
            <rect x="20" y="29.5" width="60" height="12" />
            <rect x="0" y="55" rx="2" ry="2" width="220" height="4" />
            <circle cx="220" cy="57" r="6" />
        </ContentLoader>
    );
};

export default StepSlider;
