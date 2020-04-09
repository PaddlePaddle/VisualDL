import Input, {InputProps, padding} from '~/components/Input';
import React, {FunctionComponent} from 'react';
import {WithStyled, backgroundColor, em, math, position, textLighterColor} from '~/utils/style';

import Icon from '~/components/Icon';
import styled from 'styled-components';

const iconSize = em(16);

const StyledInput = styled(Input)`
    padding-right: ${math(`${iconSize} + ${padding} * 2`)};
    width: 100%;
`;

const Control = styled.div`
    background-color: ${backgroundColor};
    position: relative;
`;

const SearchIcon = styled(Icon)`
    font-size: ${iconSize};
    display: block;
    ${position('absolute', padding, padding, null, null)}
    pointer-events: none;
    color: ${textLighterColor};
`;

const SearchInput: FunctionComponent<InputProps & WithStyled> = ({className, ...props}) => (
    <Control className={className}>
        <StyledInput {...props} />
        <SearchIcon type="search" />
    </Control>
);

export default SearchInput;
