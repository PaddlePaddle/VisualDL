import React, {FunctionComponent} from 'react';
import {WithStyled, borderFocusedColor, em, half, sameBorder, textLighterColor, transitionProps} from '~/utils/style';

import styled from 'styled-components';

export const padding = em(10);
export const height = em(36);

const StyledInput = styled.input<{rounded?: boolean}>`
    padding: ${padding};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    outline: none;
    ${props => sameBorder({radius: !props.rounded || half(height)})};
    ${transitionProps('border-color')}

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
