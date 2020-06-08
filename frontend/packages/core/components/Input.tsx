import {WithStyled, borderFocusedColor, em, half, sameBorder, textLighterColor, transitionProps} from '~/utils/style';

import React from 'react';
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

type CustomeInputProps = {
    rounded?: boolean;
    value?: string;
    onChange?: (value: string) => unknown;
};

export type InputProps = Omit<React.ComponentPropsWithoutRef<'input'>, keyof CustomeInputProps | 'type' | 'className'> &
    CustomeInputProps;

const Input = React.forwardRef<HTMLInputElement, InputProps & WithStyled>(
    ({rounded, value, onChange, className, ...props}, ref) => (
        <StyledInput
            ref={ref}
            rounded={rounded}
            value={value}
            type="text"
            className={className}
            onChange={e => onChange?.(e.target.value)}
            {...props}
        />
    )
);

Input.displayName = 'Input';

export default Input;
