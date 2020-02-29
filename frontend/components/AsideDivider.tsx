import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {rem} from '~/utils/style';

const Divider = styled.hr<{height?: string | number}>`
    background-color: transparent;
    margin: 0;
    border: none;
    height: ${({height}) => (height ? ('number' === height ? rem(height) : height) : rem(30))};
`;

type AsideDividerProps = {
    height?: string | number;
};

const AsideDivider: FunctionComponent<AsideDividerProps> = ({height}) => <Divider height={height} />;

export default AsideDivider;
