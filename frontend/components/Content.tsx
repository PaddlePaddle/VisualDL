import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {rem, headerHeight, asideWidth} from '~/utils/style';

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

const Aside = styled.aside`
    width: ${asideWidth};
    padding: ${rem(20)};
    background-color: #fff;
    flex-shrink: 0;
    flex-grow: 0;
`;

type ContentProps = {
    aside?: React.ReactNode;
};

const Content: FunctionComponent<ContentProps> = ({children, aside}) => (
    <Section>
        <Article>{children}</Article>
        {aside && <Aside>{aside}</Aside>}
    </Section>
);

export default Content;
