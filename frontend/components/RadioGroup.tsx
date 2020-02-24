import React, {FunctionComponent, createContext} from 'react';
import styled from 'styled-components';
import {WithStyled} from '~/utils/style';

const Wrapper = styled.div`
    display: inline-flex;

    > * {
        flex-shrink: 0;
        align-items: flex-start;
    }
`;

export const ValueContext = createContext(null as string | number | symbol | undefined | null);
// eslint-disable-next-line
export const EventContext = createContext((() => {}) as ((value: string | number | symbol) => unknown) | undefined);

type RadioGroupProps = {
    value?: string | number | symbol;
    onChange?: (value: string | number | symbol) => unknown;
};

const RadioGroup: FunctionComponent<RadioGroupProps & WithStyled> = ({value, onChange, children, className}) => {
    return (
        <EventContext.Provider value={onChange}>
            <ValueContext.Provider value={value}>
                <Wrapper className={className}>{children}</Wrapper>
            </ValueContext.Provider>
        </EventContext.Provider>
    );
};

export default RadioGroup;
