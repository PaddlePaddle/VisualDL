import React from 'react';
import {styled, WithStyled, em, math} from '~/utils/style';
import Input, {padding, InputProps} from '~/components/Input';

const iconSize = em(16);

const StyledInput = styled(Input)`
    padding-right: ${math(`${iconSize} + ${padding} * 2`)};
`;

const Control = styled.div`
    background-color: #fff;
    position: relative;
`;

const Icon = styled.span`
    background-image: url('/images/search.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    width: ${iconSize};
    height: ${iconSize};
    position: absolute;
    top: ${padding};
    right: ${padding};
    pointer-events: none;
`;

export default class SearchInput extends React.Component<InputProps & WithStyled> {
    render() {
        const {className, ...props} = this.props;
        return (
            <Control className={className}>
                <StyledInput {...props} />
                <Icon />
            </Control>
        );
    }
}
