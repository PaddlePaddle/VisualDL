import React, {FunctionComponent} from 'react';
import {styled, WithStyled, em, borderColor, borderRadius, duration, easing, darken, math} from '~/utils/style';

export const padding = em(10);
export const height = em(36);

const StyledInput = styled.input<{rounded?: boolean}>`
    padding: ${padding};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    width: 100%;
    border: 1px solid ${borderColor};
    border-radius: ${props => (props.rounded ? math(`${height} / 2`) : borderRadius)};
    transition: border-color ${duration} ${easing};
    outline: none;

    &:hover,
    &:focus {
        border-color: ${darken(0.15, borderColor)};
    }

    &::placeholder {
        color: #999;
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
