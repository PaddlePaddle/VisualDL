import {createComponent} from '@vue/composition-api';
import styled from 'vue-styled-components';
import Navbar from '~/components/Navbar';
import Aside from '~/components/Aside';
import {rem, headerHeight} from '~/plugins/style';

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

const Section = styled.section`
    min-height: calc(100vh - ${headerHeight});
    display: flex;
    align-items: stretch;
    justify-content: space-between;
`;

const Article = styled.article`
    margin: ${rem(20)};
    padding: ${rem(20)};
    background-color: #fff;
    flex-shrink: 1;
    flex-grow: 1;
`;

export default createComponent({
    setup() {
        return () => (
            <Main>
                <Header>
                    <Navbar></Navbar>
                </Header>
                <Section>
                    <Article>
                        <nuxt></nuxt>
                    </Article>
                    <Aside></Aside>
                </Section>
            </Main>
        );
    }
});
