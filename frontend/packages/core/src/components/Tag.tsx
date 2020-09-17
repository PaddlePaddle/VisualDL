import React, {FunctionComponent} from 'react';
import {WithStyled, em, half, transitionProps} from '~/utils/style';

import styled from 'styled-components';

const height = em(36);

const Span = styled.span<{active?: boolean}>`
    padding: 0 ${em(16)};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    border-radius: ${half(height)};
    color: ${prop => (prop.active ? 'var(--background-color)' : 'var(--primary-color)')};
    background-color: ${prop => (prop.active ? 'var(--primary-color)' : 'var(--tag-background-color)')};
    cursor: pointer;
    ${transitionProps(['color', 'background-color'])}

    &:hover {
        background-color: ${prop => (prop.active ? 'var(--primary-color)' : 'var(--tag-focused-background-color)')};
    }

    &:active {
        background-color: ${prop => (prop.active ? 'var(--primary-color)' : 'var(--tag-active-background-color)')};
    }
`;

type TagProps = {
    title?: string;
    active?: boolean;
    onClick?: () => void;
};

const Tag: FunctionComponent<TagProps & WithStyled> = ({children, ...props}) => <Span {...props}>{children}</Span>;

export default Tag;
