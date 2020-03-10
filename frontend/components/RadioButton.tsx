import React, {FunctionComponent, useContext, useCallback} from 'react';
import styled from 'styled-components';
import {
    WithStyled,
    em,
    textColor,
    textInvertColor,
    borderColor,
    borderRadius,
    backgroundColor,
    primaryColor,
    duration,
    easing,
    ellipsis,
    transitions,
    borderFocusedColor
} from '~/utils/style';
import {ValueContext, EventContext} from '~/components/RadioGroup';

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
    ${ellipsis(maxWidth)}
    text-align: center;
    border: 1px solid ${props => (props.selected ? primaryColor : borderColor)};
    ${transitions(['color', 'border-color', 'background-color'], `${duration} ${easing}`)}
    /* bring selected one to top in order to cover the sibling's border */
    ${props => (props.selected ? 'position: relative;' : '')}

    &:hover {
        border-color: ${props => (props.selected ? primaryColor : borderFocusedColor)};
    }

    &:first-of-type {
        border-top-left-radius: ${borderRadius};
        border-bottom-left-radius: ${borderRadius};
    }

    &:last-of-type {
        border-top-right-radius: ${borderRadius};
        border-bottom-right-radius: ${borderRadius};
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
