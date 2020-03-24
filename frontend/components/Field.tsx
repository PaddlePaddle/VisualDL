import React, {FunctionComponent} from 'react';
import {WithStyled, rem} from '~/utils/style';

import styled from 'styled-components';

const Wrapper = styled.div`
    & + & {
        margin-top: ${rem(20)};
    }
`;

const Label = styled.div`
    margin-bottom: ${rem(10)};
`;

type FieldProps = {
    label?: string;
};

const Field: FunctionComponent<FieldProps & WithStyled> = ({label, children, className}) => (
    <Wrapper className={className}>
        {label && <Label>{label}</Label>}
        {children}
    </Wrapper>
);

export default Field;
