import React from 'react';
import {styled, rem, headerHeight, asideWidth} from '~/utils/style';
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

const Aside = styled.aside`
    width: ${asideWidth};
    background-color: #fff;
    flex-shrink: 0;
    flex-grow: 0;
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

export function withLayout(PageContent: React.ComponentType, AsideContent?: React.ComponentType) {
    return class Layout extends React.Component {
        render() {
            return (
                <Main>
                    <Header>
                        <Navbar />
                    </Header>
                    <Section>
                        <Article>
                            <PageContent />
                        </Article>
                        {AsideContent && (
                            <Aside>
                                <AsideContent />
                            </Aside>
                        )}
                    </Section>
                </Main>
            );
        }

        static getInitialProps() {
            return {
                namespacesRequired: []
            };
        }
    };
}
