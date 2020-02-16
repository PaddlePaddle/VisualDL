import {createComponent} from '@vue/composition-api';
import styled from 'vue-styled-components';
import Navbar from '~/components/Navbar';
import {rem} from '~/plugins/style';

const headerHeight = rem(60);

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

export default createComponent({
    setup() {
        return () => (
            <Main>
                <Header>
                    <Navbar></Navbar>
                </Header>
                <nuxt></nuxt>
            </Main>
        );
    }
});
