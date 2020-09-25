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
import {position, primaryColor, size, transitionProps} from '~/utils/style';

import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';

const Wrapper = styled.div`
    ${size('100vh', '100vw')}
    ${position('fixed', 0, 0, 0, 0)}
    background-color: var(--mask-color);
    display: flex;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
    ${transitionProps('background-color')}
`;

const BodyLoading: FunctionComponent = () => {
    return (
        <Wrapper>
            <HashLoader size="60px" color={primaryColor} />
        </Wrapper>
    );
};

export default BodyLoading;
