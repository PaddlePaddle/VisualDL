import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {headerHeight} from '~/utils/style';
import Navbar from '~/components/Navbar';

const Main = styled.main`
    padding-top: ${headerHeight};
`;

const Header = styled.header`
    position: fixed;
    z-index: 10000;
    width: 100%;
    height: ${headerHeight};
    top: 0;
    left: 0;
    right: 0;
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
