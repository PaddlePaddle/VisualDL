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

import React, {FunctionComponent, useState} from 'react';
import {borderRadius, em, rem, size, transitionProps} from '~/utils/style';

import Icon from '~/components/Icon';
import styled from 'styled-components';

const Wrapper = styled.div`
    background-color: var(--background-color);
    border-radius: ${borderRadius};
    ${transitionProps('background-color')}

    & + & {
        margin-top: ${rem(4)};
    }
`;

const Header = styled.div`
    height: ${em(40)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 ${em(20)};
    color: var(--text-lighter-color);
    cursor: pointer;
    ${transitionProps('color')}

    > h3 {
        color: var(--text-color);
        flex-grow: 1;
        margin: 0;
        font-weight: 700;
        ${transitionProps('color')}
    }

    > .total {
        margin-right: ${em(20)};
    }
`;

const Content = styled.div`
    border-top: 1px solid var(--border-color);
    padding: ${rem(20)};
    ${transitionProps('border-color')}
`;

const CollapseIcon = styled(Icon)<{opened?: boolean}>`
    ${size(em(14))}
    display: block;
    flex-shrink: 0;
    transform: rotate(${props => (props.opened ? '180' : '0')}deg) scale(${10 / 14});
    ${transitionProps('transform')}
`;

type ChartCollapseProps = {
    title: string;
    opened?: boolean;
    total?: number;
};

const ChartCollapse: FunctionComponent<ChartCollapseProps> = ({opened, title, total, children}) => {
    const [isOpened, setOpened] = useState(opened !== false);

    return (
        <Wrapper>
            <Header onClick={() => setOpened(o => !o)}>
                <h3>{title}</h3>
                {total != null ? <span className="total">{total}</span> : null}
                <CollapseIcon type="chevron-down" opened={isOpened} />
            </Header>
            {isOpened ? <Content>{children}</Content> : null}
        </Wrapper>
    );
};

export default ChartCollapse;
