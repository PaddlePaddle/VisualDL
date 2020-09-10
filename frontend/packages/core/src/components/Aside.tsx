import React, {FunctionComponent} from 'react';
import {WithStyled, asideWidth, rem, size} from '~/utils/style';

import styled from 'styled-components';

export const AsideSection = styled.section`
    margin: ${rem(20)};

    &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: ${rem(20)};
        margin-bottom: 0;
    }
`;

const Wrapper = styled.div<{width?: string | number}>`
    ${props => size('100%', props.width == null ? asideWidth : props.width)}
    overflow: hidden;
    display: flex;
    flex-direction: column;

    > .aside-top {
        flex: auto;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: auto;
        overflow-x: hidden;
        overflow-y: auto;

        > ${AsideSection} {
            flex: none;
        }
    }

    > .aside-bottom {
        flex: none;
        box-shadow: 0 -${rem(5)} ${rem(16)} 0 rgba(0, 0, 0, 0.03);
        padding: ${rem(20)};
    }
`;

type AsideProps = {
    width?: string | number;
    bottom?: React.ReactNode;
};

const Aside: FunctionComponent<AsideProps & WithStyled> = ({width, bottom, className, children}) => {
    return (
        <Wrapper width={width} className={className}>
            <div className="aside-top">{children}</div>
            {bottom && <div className="aside-bottom">{bottom}</div>}
        </Wrapper>
    );
};

export default Aside;
