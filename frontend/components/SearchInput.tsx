import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {WithStyled, em, math, textLightColor} from '~/utils/style';
import Input, {padding, InputProps} from '~/components/Input';
import Icon from '~/components/Icon';

const iconSize = em(16);

const StyledInput = styled(Input)`
    padding-right: ${math(`${iconSize} + ${padding} * 2`)};
    width: 100%;
`;

const Control = styled.div`
    background-color: #fff;
    position: relative;
`;

const SearchIcon = styled(Icon)`
    font-size: ${iconSize};
    display: block;
    position: absolute;
    top: ${padding};
    right: ${padding};
    pointer-events: none;
    color: ${textLightColor};
`;

const SearchInput: FunctionComponent<InputProps & WithStyled> = ({className, ...props}) => (
    <Control className={className}>
        <StyledInput {...props} />
        <SearchIcon type="search" />
    </Control>
);

export default SearchInput;
