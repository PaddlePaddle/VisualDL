import Input, {InputProps, padding} from '~/components/Input';
import React, {FunctionComponent} from 'react';
import {WithStyled, em, math, position, textLighterColor} from '~/utils/style';

import Icon from '~/components/Icon';
import styled from 'styled-components';

const iconSize = em(16);

const StyledInput = styled(Input)`
    padding-left: ${math(`${iconSize} + ${padding} * 2`)};
    width: 100%;
`;

const Control = styled.div`
    position: relative;
`;

const SearchIcon = styled(Icon)`
    font-size: ${iconSize};
    display: block;
    ${position('absolute', padding, null, null, padding)}
    pointer-events: none;
    color: ${textLighterColor};
`;

const SearchInput: FunctionComponent<InputProps & WithStyled> = ({className, ...props}) => (
    <Control className={className}>
        <SearchIcon type="search" />
        <StyledInput {...props} />
    </Control>
);

export default SearchInput;
