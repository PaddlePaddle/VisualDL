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
import {rem, transitionProps} from '~/utils/style';

import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Sidebar = styled.div`
    height: 100%;
    background-color: var(--background-color);
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

const Content = styled.div`
    padding: ${rem(20)};
    height: calc(100% - ${rem(60)});
    overflow: auto;
`;

type GraphSidebarProps = {
    title: string;
    onClose?: () => unknown;
};

const GraphSidebar: FunctionComponent<GraphSidebarProps> = ({title, onClose, children}) => {
    const {t} = useTranslation('common');

    return (
        <Sidebar>
            <Title>
                <span>{title}</span>
                <a className="close" onClick={() => onClose?.()}>
                    {t('common:close')}
                </a>
            </Title>
            <Content>{children}</Content>
        </Sidebar>
    );
};

export default GraphSidebar;
