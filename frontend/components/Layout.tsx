import React from 'react';
import {styled, headerHeight} from '~/utils/style';
import Navbar from '~/components/Navbar';

const Main = styled.main`
    padding-top: ${headerHeight};
`;

const Header = styled.header`
    position: fixed;
    width: 100%;
    height: ${headerHeight};
    top: 0;
    left: 0;
    right: 0;
`;

export default class Layout extends React.Component {
    render() {
        const {children} = this.props;
        return (
            <Main>
                <Header>
                    <Navbar />
                </Header>
                {children}
            </Main>
        );
    }
}
