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
import {WithStyled, asideWidth, rem, size, transitionProps} from '~/utils/style';

import styled from 'styled-components';

export const AsideSection = styled.section`
    margin: ${rem(20)};

    &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: ${rem(20)};
        margin-bottom: 0;
        ${transitionProps('border-color')}
    }
`;

const Wrapper = styled.div<{width?: string | number}>`
    ${props => size('100%', props.width == null ? asideWidth : props.width)}
    overflow: hidden;
    display: flex;
    flex-direction: column;

    > .aside-top {
        flex: auto;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: auto;
        overflow-x: hidden;
        overflow-y: auto;

        > ${AsideSection} {
            flex: none;
        }
    }

    > .aside-bottom {
        flex: none;
        box-shadow: 0 -${rem(5)} ${rem(16)} 0 rgba(0, 0, 0, 0.03);
        padding: ${rem(20)};
    }
`;

type AsideProps = {
    width?: string | number;
    bottom?: React.ReactNode;
};

const Aside: FunctionComponent<AsideProps & WithStyled> = ({width, bottom, className, children}) => {
    return (
        <Wrapper width={width} className={className}>
            <div className="aside-top">{children}</div>
            {bottom && <div className="aside-bottom">{bottom}</div>}
        </Wrapper>
    );
};

export default Aside;
