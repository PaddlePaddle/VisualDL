import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {rem, math, headerHeight, asideWidth, backgroundColor} from '~/utils/style';

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
`;

type ContentProps = {
    aside?: React.ReactNode;
};

const Content: FunctionComponent<ContentProps> = ({children, aside}) => (
    <Section>
        <Article aside={!!aside}>{children}</Article>
        {aside && <Aside>{aside}</Aside>}
    </Section>
);

export default Content;
