import React, {FunctionComponent} from 'react';
import {headerHeight, position, size} from '~/utils/style';

import Navbar from '~/components/Navbar';
import styled from 'styled-components';

const Main = styled.main`
    padding-top: ${headerHeight};
`;

const Header = styled.header`
    z-index: 10000;

    ${size(headerHeight, '100%')}
    ${position('fixed', 0, 0, null, 0)}
`;

const Layout: FunctionComponent = ({children}) => (
    <Main>
        <Header>
            <Navbar />
        </Header>
        {children}
    </Main>
);

export default Layout;
