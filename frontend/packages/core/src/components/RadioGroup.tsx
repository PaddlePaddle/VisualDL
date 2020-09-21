import React, {FunctionComponent, PropsWithChildren, createContext, useCallback, useState} from 'react';

import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: inline-flex;

    > * {
        flex-shrink: 0;
        align-items: flex-start;
    }
`;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const EventContext = createContext<(<V extends unknown>(value: V) => unknown) | undefined>(() => {});
export const ValueContext = createContext<unknown>(null);

type RadioGroupProps<T> = {
    value?: T;
    onChange?: (value: T) => unknown;
};

const RadioGroup = <T extends unknown>({
    value,
    onChange,
    children,
    className
}: PropsWithChildren<RadioGroupProps<T>> & WithStyled): ReturnType<FunctionComponent> => {
    const [selected, setSelected] = useState(value);
    const onSelectedChange = useCallback(
        (value: T) => {
            setSelected(value);
            onChange?.(value);
        },
        [onChange]
    );

    return (
        <EventContext.Provider value={v => onSelectedChange(v as T)}>
            <ValueContext.Provider value={selected}>
                <Wrapper className={className}>{children}</Wrapper>
            </ValueContext.Provider>
        </EventContext.Provider>
    );
};

export default RadioGroup;
