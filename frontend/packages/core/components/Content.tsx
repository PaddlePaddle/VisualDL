import React, {FunctionComponent} from 'react';
import {
    asideWidth,
    backgroundColor,
    contentHeight,
    contentMargin,
    headerHeight,
    math,
    position,
    primaryColor,
    size
} from '~/utils/style';

import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';

const Section = styled.section`
    /* trigger BFC */
    overflow: hidden;
`;

const Article = styled.article<{aside?: boolean}>`
    margin: ${contentMargin};
    margin-right: ${props => (props.aside ? math(`${contentMargin} + ${asideWidth}`) : contentMargin)};
    min-height: ${contentHeight};
`;

const Aside = styled.aside`
    background-color: ${backgroundColor};
    ${size(`calc(100vh - ${headerHeight})`, asideWidth)}
    ${position('fixed', headerHeight, 0, null, null)}
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
        <Article aside={!!aside}>{children}</Article>
        {aside && <Aside>{aside}</Aside>}
        {loading && (
            <Loading>
                <HashLoader size="60px" color={primaryColor} />
            </Loading>
        )}
    </Section>
);

export default Content;
