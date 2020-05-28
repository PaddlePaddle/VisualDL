import React, {FunctionComponent} from 'react';
import {WithStyled, borderColor, rem} from '~/utils/style';

import styled from 'styled-components';

export const AsideSection = styled.section`
    margin: ${rem(20)} ${rem(20)} 0;

    &:not(:last-child) {
        border-bottom: 1px solid ${borderColor};
        padding-bottom: ${rem(20)};
    }
`;

const Wrapper = styled.div`
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    > .aside-top {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;

        > ${AsideSection} {
            flex: 0 0 auto;
        }
    }

    > .aside-bottom {
        flex: 0 0 auto;
        box-shadow: 0 -${rem(5)} ${rem(16)} 0 rgba(0, 0, 0, 0.03);
        padding: ${rem(20)};
    }
`;

type AsideProps = {
    bottom?: React.ReactNode;
};

const Aside: FunctionComponent<AsideProps & WithStyled> = ({bottom, className, children}) => {
    return (
        <Wrapper className={className}>
            <div className="aside-top">{children}</div>
            {bottom && <div className="aside-bottom">{bottom}</div>}
        </Wrapper>
    );
};

export default Aside;
