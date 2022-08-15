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
import {WithStyled, contentHeight, contentMargin, headerHeight, position, transitionProps} from '~/utils/style';

import BodyLoading from '~/components/BodyLoading';
import styled from 'styled-components';

const Section = styled.section`
    display: flex;
    font-family: PingFangSC-Regular;
    aside {
        position: static;
        height: auto;
    }
`;

const Article = styled.article`
    flex: auto;
    min-width: 0;
    margin: ${contentMargin};
    min-height: ${contentHeight};
`;

const Aside = styled.aside`
    flex: none;
    background-color: var(--background-color);
    height: ${`calc(100vh - ${headerHeight})`};
    ${position('sticky', headerHeight, 0, null, null)}
    overflow-x: hidden;
    overflow-y: auto;
    ${transitionProps('background-color')}
`;
const ProfilerAside = styled.aside`
    flex: none;
    background-color: var(--background-color);
    height: auto;
    position: static;
    overflow-x: hidden;
    overflow-y: auto;
    ${transitionProps('background-color')}
`;

type ContentProps = {
    aside?: React.ReactNode;
    leftAside?: React.ReactNode;
    loading?: boolean;
    isProfiler?: boolean;
};

const Content: FunctionComponent<ContentProps & WithStyled> = ({
    children,
    aside,
    leftAside,
    loading,
    className,
    isProfiler
}) => (
    <Section className={className}>
        {leftAside && <Aside>{leftAside}</Aside>}
        <Article>{children}</Article>
        {aside && isProfiler ? <ProfilerAside>{aside}</ProfilerAside> : aside ? <Aside>{aside}</Aside> : null}
        {loading && <BodyLoading />}
    </Section>
);

export default Content;
