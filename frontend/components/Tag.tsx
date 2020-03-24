import React, {FunctionComponent} from 'react';
import {
    WithStyled,
    backgroundColor,
    em,
    half,
    lightActiveColor,
    lightColor,
    lightFocusedColor,
    primaryColor,
    transitionProps
} from '~/utils/style';

import styled from 'styled-components';

const height = em(36);

const Span = styled.span<{active?: boolean}>`
    padding: 0 ${em(16)};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    border-radius: ${half(height)};
    color: ${prop => (prop.active ? backgroundColor : primaryColor)};
    background-color: ${prop => (prop.active ? primaryColor : lightColor)};
    cursor: pointer;
    ${transitionProps(['color', 'background-color'])}

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
