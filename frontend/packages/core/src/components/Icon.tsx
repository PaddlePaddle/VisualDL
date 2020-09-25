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

import React, {FunctionComponent, Suspense, useMemo} from 'react';

import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const Wrapper = styled.i`
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
`;

export type Icons = string;

type IconProps = {
    type: Icons;
    onClick?: () => unknown;
};

const Icon: FunctionComponent<IconProps & WithStyled> = ({type, onClick, className}) => {
    const Svg = useMemo(() => React.lazy(() => import(`${PUBLIC_PATH}/icons/${type}.js`)), [type]);

    return (
        <Wrapper className={`vdl-icon icon-${type} ${className ?? ''}`} onClick={() => onClick?.()}>
            <Suspense fallback="">
                <Svg />
            </Suspense>
        </Wrapper>
    );
};

export default Icon;
