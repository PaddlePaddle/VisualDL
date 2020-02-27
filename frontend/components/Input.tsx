import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {
    WithStyled,
    em,
    textLighterColor,
    borderColor,
    borderFocusedColor,
    borderRadius,
    duration,
    easing,
    math
} from '~/utils/style';

export const padding = em(10);
export const height = em(36);

const StyledInput = styled.input<{rounded?: boolean}>`
    padding: ${padding};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    border: 1px solid ${borderColor};
    border-radius: ${props => (props.rounded ? math(`${height} / 2`) : borderRadius)};
    transition: border-color ${duration} ${easing};
    outline: none;

    &:hover,
    &:focus {
        border-color: ${borderFocusedColor};
    }

    &::placeholder {
        color: ${textLighterColor};
    }
`;

export type InputProps = {
    rounded?: boolean;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => unknown;
};

const Input: FunctionComponent<InputProps & WithStyled> = ({rounded, placeholder, value, onChange, className}) => (
    <StyledInput
        rounded={rounded}
        placeholder={placeholder}
        value={value}
        type="text"
        className={className}
        onChange={e => onChange?.(e.target.value)}
    ></StyledInput>
);

export default Input;
