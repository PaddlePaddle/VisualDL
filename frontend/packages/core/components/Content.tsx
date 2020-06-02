import React, {FunctionComponent} from 'react';
import {backgroundColor, contentHeight, contentMargin, headerHeight, position, primaryColor, size} from '~/utils/style';

import HashLoader from 'react-spinners/HashLoader';
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
    background-color: ${backgroundColor};
    height: ${`calc(100vh - ${headerHeight})`};
    ${position('sticky', headerHeight, 0, null, null)}
    overflow-x: hidden;
    overflow-y: auto;
`;

const Loading = styled.div`
    ${size('100vh', '100vw')}
    ${position('fixed', 0, 0, 0, 0)}
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
`;

type ContentProps = {
    aside?: React.ReactNode;
    loading?: boolean;
};

const Content: FunctionComponent<ContentProps> = ({children, aside, loading}) => (
    <Section>
        <Article>{children}</Article>
        {aside && <Aside>{aside}</Aside>}
        {loading && (
            <Loading>
                <HashLoader size="60px" color={primaryColor} />
            </Loading>
        )}
    </Section>
);

export default Content;
