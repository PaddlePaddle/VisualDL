import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {
    WithStyled,
    backgroundColor,
    darken,
    ellipsis,
    em,
    half,
    lighten,
    math,
    position,
    primaryColor,
    sameBorder,
    size,
    textInvertColor,
    textLighterColor,
    transitionProps
} from '~/utils/style';

import styled from 'styled-components';

const height = em(20);
const checkSize = em(16);
const checkMark =
    // eslint-disable-next-line
    'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCAxMSA4IiB3aWR0aD0iMTEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTkuNDc5NDI3MDggMTAuMTg3NWgtNS4yNXYtMS4zMTI1aDMuOTM3bC4wMDA1LTcuODc1aDEuMzEyNXoiIGZpbGw9IiNmNWY1ZjUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdHJhbnNmb3JtPSJtYXRyaXgoLjcwNzEwNjc4IC43MDcxMDY3OCAtLjcwNzEwNjc4IC43MDcxMDY3OCA0Ljk2Mjk5NCAtNi4yMDg0NCkiLz48L3N2Zz4=';

const Wrapper = styled.label<{disabled?: boolean}>`
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

const Input = styled.input.attrs<{disabled?: boolean}>(props => ({
    type: 'checkbox',
    disabled: !!props.disabled
}))`
    ${size(0)}
    ${position('absolute', 0, null, null, 0)}
    opacity: 0;
    pointer-events: none;
`;

const Inner = styled.div<{checked?: boolean; size?: string; disabled?: boolean}>`
    color: ${props => (props.checked ? textInvertColor : 'transparent')};
    flex-shrink: 0;
    ${props => size(math(`${checkSize} * ${props.size === 'small' ? 0.875 : 1}`))}
    margin: ${half(`${height} - ${checkSize}`)} 0;
    margin-right: ${em(10)};
    ${props => sameBorder({color: props.disabled || !props.checked ? textLighterColor : primaryColor})};
    background-color: ${props =>
        props.disabled
            ? props.checked
                ? textLighterColor
                : lighten(1 / 3, textLighterColor)
            : props.checked
            ? primaryColor
            : backgroundColor};
    background-image: ${props => (props.checked ? `url("${checkMark}")` : 'none')};
    background-repeat: no-repeat;
    background-position: center center;
    background-size: ${em(10)} ${em(8)};
    position: relative;
    ${transitionProps(['border-color', 'background-color', 'color'])}

    ${Wrapper}:hover > & {
        border-color: ${props =>
            props.disabled ? textLighterColor : props.checked ? primaryColor : darken(0.1, textLighterColor)};
    }
`;

const Content = styled.div<{disabled?: boolean}>`
    line-height: ${height};
    flex-grow: 1;
    ${props => (props.disabled ? `color: ${textLighterColor};` : '')}
    ${ellipsis()}
`;

type CheckboxProps = {
    value?: boolean;
    onChange?: (value: boolean) => unknown;
    size?: 'small';
    title?: string;
    disabled?: boolean;
};

const Checkbox: FunctionComponent<CheckboxProps & WithStyled> = ({
    value,
    children,
    size,
    disabled,
    className,
    title,
    onChange
}) => {
    const [checked, setChecked] = useState(!!value);
    useEffect(() => setChecked(!!value), [setChecked, value]);
    const onChangeInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) {
                return;
            }
            setChecked(e.target.checked);
            onChange?.(e.target.checked);
        },
        [disabled, onChange]
    );

    return (
        <Wrapper disabled={disabled} className={className} title={title}>
            <Input onChange={onChangeInput} checked={checked} disabled={disabled} />
            <Inner checked={checked} size={size} disabled={disabled} />
            <Content disabled={disabled}>{children}</Content>
        </Wrapper>
    );
};

export default Checkbox;
