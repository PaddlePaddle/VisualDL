import React, {FunctionComponent} from 'react';
import {styled, WithStyled, em, primaryColor, lightColor, duration, easing, math, darken} from '~/utils/style';

const height = em(36);

const Span = styled.span<{active?: boolean}>`
    padding: 0 ${em(16)};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    border-radius: ${math(`${height} / 2`)};
    transition: color ${duration} ${easing}, background-color ${duration} ${easing};
    color: ${prop => (prop.active ? '#FFF' : primaryColor)};
    background-color: ${prop => (prop.active ? primaryColor : lightColor)};
    cursor: pointer;

    &:hover {
        background-color: ${prop => (prop.active ? primaryColor : darken(0.03, lightColor))};
    }
`;

type TagProps = {
    active?: boolean;
    onClick?: () => void;
};

const Tag: FunctionComponent<TagProps & WithStyled> = ({children, ...props}) => <Span {...props}>{children}</Span>;

export default Tag;
