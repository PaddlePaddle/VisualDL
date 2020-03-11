import React, {FunctionComponent, createContext, useState, useCallback} from 'react';
import styled from 'styled-components';
import {WithStyled} from '~/utils/style';

const Wrapper = styled.div`
    display: inline-flex;

    > * {
        flex-shrink: 0;
        align-items: flex-start;
    }
`;

export const ValueContext = createContext<string | number | symbol | undefined | null>(null);
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const EventContext = createContext<((value: string | number | symbol) => unknown) | undefined>(() => {});

type RadioGroupProps = {
    value?: string | number | symbol;
    onChange?: (value: string | number | symbol) => unknown;
};

const RadioGroup: FunctionComponent<RadioGroupProps & WithStyled> = ({value, onChange, children, className}) => {
    const [selected, setSelected] = useState(value);
    const onSelectedChange = useCallback(
        (value: string | number | symbol) => {
            setSelected(value);
            onChange?.(value);
        },
        [onChange]
    );

    return (
        <EventContext.Provider value={onSelectedChange}>
            <ValueContext.Provider value={selected}>
                <Wrapper className={className}>{children}</Wrapper>
            </ValueContext.Provider>
        </EventContext.Provider>
    );
};

export default RadioGroup;
