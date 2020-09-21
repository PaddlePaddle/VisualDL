import React, {FunctionComponent} from 'react';
import {contentHeight, contentMargin, headerHeight, position, transitionProps} from '~/utils/style';

import BodyLoading from '~/components/BodyLoading';
import styled from 'styled-components';

const Section = styled.section`
    display: flex;
`;

const Article = styled.article`
    flex: auto;
    margin: ${contentMargin};
    min-height: ${contentHeight};
`;

const Aside = styled.aside`
    flex: none;
    background-color: var(--background-color);
    height: ${`calc(100vh - ${headerHeight})`};
    ${position('sticky', headerHeight, 0, null, null)}
    overflow-x: hidden;
    overflow-y: auto;
    ${transitionProps('background-color')}
`;

type ContentProps = {
    aside?: React.ReactNode;
    loading?: boolean;
};

const Content: FunctionComponent<ContentProps> = ({children, aside, loading}) => (
    <Section>
        <Article>{children}</Article>
        {aside && <Aside>{aside}</Aside>}
        {loading && <BodyLoading />}
    </Section>
);

export default Content;
