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
import  {WithStyled, rem, transitionProps, zIndexes} from '~/utils/style';
import BodyLoading from '~/components/BodyLoading';
import styled from 'styled-components';

const Section = styled.section.attrs<{showDrawer: boolean, width: string}>(({showDrawer, width}) => ({
    style: {
        transform: showDrawer ? 'translateX(0)' : `translateX(-${width})`
    }
}))<{showDrawer: boolean, width: string}>`
    height: 100%;
    position: absolute;
    z-index: ${zIndexes.drawer};
    background-color: var(--background-color);
    box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.15);
    ${transitionProps('transform')};
`;

const Title = styled.div`
    height: ${rem(60)};
    font-size: ${rem(16)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    margin: 0 ${rem(20)};
    ${transitionProps('border-color')}

    > .close {
        flex: none;
        color: var(--text-light-color);
        cursor: pointer;
        ${transitionProps('color')}
    }
`;

const Article = styled.article.attrs<{width: string}>(({width}) => ({
    style: {
        width
    }
}))<{width: string}>`
    min-width: 300px;
    height: calc(100% - ${rem(60)});
    padding: ${rem(20)};
    overflow: auto;
`;

type DrawerProps = {
    title?: string;
    drawerWidth: string;
    show: boolean;
    loading?: boolean;
};

const Drawer: FunctionComponent<DrawerProps & WithStyled> = ({title, drawerWidth, show, children, loading, className}) => (
    <Section
        className={className}
        showDrawer={show || false}
        width={drawerWidth}
    >
        <Title>
            <span>{title}</span>
        </Title>
        <Article width={drawerWidth}>{children}</Article>
        {loading && <BodyLoading />}
    </Section>
);

export default Drawer;
