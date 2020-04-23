import {EventContext, ValueContext} from '~/components/RadioGroup';
import React, {FunctionComponent, useCallback, useContext} from 'react';
import {
    WithStyled,
    backgroundColor,
    borderColor,
    borderFocusedColor,
    borderRadius,
    borderRadiusShortHand,
    ellipsis,
    em,
    primaryColor,
    sameBorder,
    textColor,
    textInvertColor,
    transitionProps
} from '~/utils/style';

import styled from 'styled-components';

const height = em(36);
const minWidth = em(72);
const maxWidth = em(144);

const Button = styled.a<{selected?: boolean}>`
    cursor: pointer;
    background-color: ${props => (props.selected ? primaryColor : backgroundColor)};
    color: ${props => (props.selected ? textInvertColor : textColor)};
    height: ${height};
    line-height: calc(${height} - 2px);
    min-width: ${minWidth};
    padding: 0 ${em(8)};
    text-align: center;
    ${ellipsis(maxWidth)}
    ${props => sameBorder({color: props.selected ? primaryColor : borderColor})};
    ${transitionProps(['color', 'border-color', 'background-color'])}

    /* bring selected one to top in order to cover the sibling's border */
    ${props => (props.selected ? 'position: relative;' : '')}

    &:hover {
        border-color: ${props => (props.selected ? primaryColor : borderFocusedColor)};
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

type RadioButtonProps = {
    selected?: boolean;
    title?: string;
    value?: string | number | symbol;
};

const RadioButton: FunctionComponent<RadioButtonProps & WithStyled> = ({
    className,
    value,
    selected,
    title,
    children
}) => {
    const groupValue = useContext(ValueContext);
    const onChange = useContext(EventContext);

    const onClick = useCallback(() => {
        if (value && onChange && groupValue !== value) {
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
