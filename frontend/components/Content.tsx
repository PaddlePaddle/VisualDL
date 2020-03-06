import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import HashLoader from 'react-spinners/HashLoader';
import {rem, math, headerHeight, asideWidth, backgroundColor, primaryColor} from '~/utils/style';

const margin = rem(20);
const padding = rem(20);

const Section = styled.section`
    /* trigger BFC */
    overflow: hidden;
`;

const Article = styled.article<{aside?: boolean}>`
    margin: ${margin};
    margin-right: ${props => (props.aside ? math(`${margin} + ${asideWidth}`) : margin)};
    padding: ${padding};
    background-color: ${backgroundColor};
    min-height: calc(100vh - ${math(`${margin} * 2 + ${headerHeight}`)});
`;

const Aside = styled.aside`
    width: ${asideWidth};
    padding: ${padding};
    background-color: ${backgroundColor};
    height: calc(100vh - ${headerHeight});
    position: fixed;
    top: ${headerHeight};
    right: 0;
    overflow-x: hidden;
    overflow-y: auto;
`;

const Loading = styled.div`
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
