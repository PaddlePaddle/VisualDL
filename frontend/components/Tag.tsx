import React, {FunctionComponent} from 'react';
import {
    styled,
    WithStyled,
    em,
    primaryColor,
    lightColor,
    lightFocusedColor,
    lightActiveColor,
    duration,
    easing,
    math,
    transitions
} from '~/utils/style';

const height = em(36);

const Span = styled.span<{active?: boolean}>`
    padding: 0 ${em(16)};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    border-radius: ${math(`${height} / 2`)};
    ${transitions(['color', 'background-color'], `${duration} ${easing}`)}
    color: ${prop => (prop.active ? '#FFF' : primaryColor)};
    background-color: ${prop => (prop.active ? primaryColor : lightColor)};
    cursor: pointer;

    &:hover {
        background-color: ${prop => (prop.active ? primaryColor : lightFocusedColor)};
    }

    &:active {
        background-color: ${prop => (prop.active ? primaryColor : lightActiveColor)};
    }
`;

type TagProps = {
    title?: string;
    active?: boolean;
    onClick?: () => void;
};

const Tag: FunctionComponent<TagProps & WithStyled> = ({children, ...props}) => <Span {...props}>{children}</Span>;

export default Tag;
