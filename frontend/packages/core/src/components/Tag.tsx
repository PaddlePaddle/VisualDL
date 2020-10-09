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
import {WithStyled, em, half, transitionProps} from '~/utils/style';

import styled from 'styled-components';

const height = em(36);

const Span = styled.span<{active?: boolean}>`
    padding: 0 ${em(16)};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    border-radius: ${half(height)};
    color: ${prop => (prop.active ? 'var(--background-color)' : 'var(--primary-color)')};
    background-color: ${prop => (prop.active ? 'var(--primary-color)' : 'var(--tag-background-color)')};
    cursor: pointer;
    ${transitionProps(['color', 'background-color'])}

    &:hover {
        background-color: ${prop => (prop.active ? 'var(--primary-color)' : 'var(--tag-focused-background-color)')};
    }

    &:active {
        background-color: ${prop => (prop.active ? 'var(--primary-color)' : 'var(--tag-active-background-color)')};
    }
`;

type TagProps = {
    title?: string;
    active?: boolean;
    onClick?: () => void;
};

const Tag: FunctionComponent<TagProps & WithStyled> = ({children, ...props}) => <Span {...props}>{children}</Span>;

export default Tag;
