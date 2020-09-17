import Input, {InputProps, padding} from '~/components/Input';
import React, {FunctionComponent, useCallback, useRef} from 'react';
import {WithStyled, math, position, transitionProps} from '~/utils/style';

import Icon from '~/components/Icon';
import styled from 'styled-components';

const searchIconSize = '1.142857143';
const closeIconSize = '0.857142857';

const StyledInput = styled(Input)`
    padding-left: ${math(`1em * ${searchIconSize} + ${padding} * 2`)};
    padding-right: ${math(`1em * ${closeIconSize} + ${padding} * 2`)};
    width: 100%;
`;

const Control = styled.div`
    position: relative;
`;

const SearchIcon = styled(Icon)`
    display: block;
    transform: translateY(-50%) scale(${searchIconSize});
    transform-origin: center;
    ${position('absolute', '50%', null, null, padding)}
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
            <SearchIcon type="search" />
            <StyledInput ref={input} value={value} onChange={onChange} {...props} />
            {!!value && <CloseIcon type="close" onClick={clear} />}
        </Control>
    );
};

export default SearchInput;
