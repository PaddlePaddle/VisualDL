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

import Input, {InputProps, padding} from '~/components/Input';
import React, {FunctionComponent, useCallback, useRef} from 'react';
import {WithStyled, math, position, transitionProps} from '~/utils/style';
import {rem} from '~/utils/style';
import Icon from '~/components/Icon';
import styled from 'styled-components';

const searchIconSize = '0.962857143';
const closeIconSize = '0.857142857';

const StyledInput = styled(Input)`
    // padding-left: ${math(`1em * ${searchIconSize} + ${padding} * 2`)};
    // padding-right: ${math(`1em * ${closeIconSize} + ${padding} * 2`)};
    width: 100%;
    font-size: ${rem('14px')};
    border-radius: ${rem('4px')};
    font-family: PingFangSC-Regular;
    color: #999999;
    letter-spacing: 0;
    line-height: 14px;
    font-weight: 400;
`;

const Control = styled.div`
    position: relative;
`;

const SearchIcon = styled(Icon)`
    display: block;
    transform: translateY(-50%) scale(${searchIconSize});
    transform-origin: center;
    ${position('absolute', '53%', `${math(`1em * ${searchIconSize}`)}`, null, null)}
    pointer-events: none;
    color: var(--text-lighter-color);
    ${transitionProps('color')}
`;

const CloseIcon = styled(Icon)`
    display: block;
    transform: translateY(-50%) scale(${closeIconSize});
    transform-origin: center;
    ${position('absolute', '50%', padding, null, null)}
    cursor: pointer;
    color: var(--text-lighter-color);
    ${transitionProps('color')}

    &:hover {
        color: var(--text-light-color);
    }

    &:active {
        color: var(--text-color);
    }
`;

const SearchInput: FunctionComponent<InputProps & WithStyled> = ({className, value, onChange, ...props}) => {
    const input = useRef<HTMLInputElement | null>(null);
    const clear = useCallback(() => {
        onChange?.('');
        input.current?.focus();
    }, [onChange]);

    return (
        <Control className={className}>
            <StyledInput ref={input} value={value} onChange={onChange} {...props} />
            {!!value && <CloseIcon type="close" onClick={clear} />}
            {!value && <SearchIcon type="search" />}
        </Control>
    );
};

export default SearchInput;
