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

import {Resizer} from '~/components/Table';
import type {HeaderProps as TableHeaderProps} from 'react-table';
import type {WithStyled} from '~/utils/style';

const Header: FunctionComponent<TableHeaderProps<Record<string, unknown>> & WithStyled> = ({
    column,
    className,
    children
}) => {
    return (
        <>
            <span className={className}>{children ?? column.id}</span>
            {column.canResize ? (
                <Resizer {...column.getResizerProps()} className={column.isResizing ? 'is-resizing' : ''} />
            ) : null}
        </>
    );
};

export default Header;
