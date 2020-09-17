import {EventContext, ValueContext} from '~/components/RadioGroup';
import React, {FunctionComponent, PropsWithChildren, useCallback, useContext} from 'react';
import {
    WithStyled,
    borderRadius,
    borderRadiusShortHand,
    ellipsis,
    em,
    sameBorder,
    transitionProps
} from '~/utils/style';

import styled from 'styled-components';

const height = em(36);
const minWidth = em(72);
const maxWidth = em(144);

const Button = styled.a<{selected?: boolean}>`
    cursor: pointer;
    background-color: ${props => (props.selected ? 'var(--primary-color)' : 'var(--background-color)')};
    color: ${props => (props.selected ? 'var(--primary-text-color)' : 'var(--text-color)')};
    height: ${height};
    line-height: calc(${height} - 2px);
    min-width: ${minWidth};
    padding: 0 ${em(8)};
    text-align: center;
    ${ellipsis(maxWidth)}
    ${props => sameBorder({color: props.selected ? 'var(--primary-color)' : 'var(--border-color)'})};
    ${transitionProps(['color', 'border-color', 'background-color'])}

    /* bring selected one to top in order to cover the sibling's border */
    ${props => (props.selected ? 'position: relative;' : '')}

    &:hover {
        border-color: ${props => (props.selected ? 'var(--primary-color)' : 'var(--border-focused-color)')};
    }

    &:first-of-type {
        ${borderRadiusShortHand('left', borderRadius)}
    }

    &:last-of-type {
        ${borderRadiusShortHand('right', borderRadius)}
    }

    & + & {
        margin-left: -1px;
    }
`;

type RadioButtonProps<T> = {
    selected?: boolean;
    title?: string;
    value?: T;
};

const RadioButton = <T extends unknown>({
    className,
    value,
    selected,
    title,
    children
}: PropsWithChildren<RadioButtonProps<T>> & WithStyled): ReturnType<FunctionComponent> => {
    const groupValue = useContext(ValueContext);
    const onChange = useContext(EventContext);

    const onClick = useCallback(() => {
        if (value != null && onChange && groupValue !== value) {
            onChange(value);
        }
    }, [value, onChange, groupValue]);

    return (
        <Button className={className} title={title} selected={groupValue === value || selected} onClick={onClick}>
            {children}
        </Button>
    );
};

export default RadioButton;
