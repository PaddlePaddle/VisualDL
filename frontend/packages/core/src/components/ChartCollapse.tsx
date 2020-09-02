import React, {FunctionComponent, useState} from 'react';
import {
    backgroundColor,
    borderRadius,
    em,
    rem,
    size,
    textColor,
    textLighterColor,
    transitionProps
} from '~/utils/style';

import Icon from '~/components/Icon';
import styled from 'styled-components';

const Wrapper = styled.div`
    background-color: ${backgroundColor};
    border-radius: ${borderRadius};

    & + & {
        margin-top: ${rem(4)};
    }
`;

const Header = styled.div`
    height: ${em(40)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 ${em(20)};
    color: ${textLighterColor};
    cursor: pointer;

    > h3 {
        color: ${textColor};
        flex-grow: 1;
        margin: 0;
        font-weight: 700;
    }

    > .total {
        margin-right: ${em(20)};
    }
`;

const Content = styled.div`
    border-top: 1px solid #eee;
    padding: ${rem(20)};
`;

const CollapseIcon = styled(Icon)<{opened?: boolean}>`
    ${size(em(14))}
    display: block;
    flex-shrink: 0;
    transform: rotate(${props => (props.opened ? '180' : '0')}deg) scale(${10 / 14});
    ${transitionProps('transform')}
`;

type ChartCollapseProps = {
    title: string;
    opened?: boolean;
    total?: number;
};

const ChartCollapse: FunctionComponent<ChartCollapseProps> = ({opened, title, total, children}) => {
    const [isOpened, setOpened] = useState(opened !== false);

    return (
        <Wrapper>
            <Header onClick={() => setOpened(o => !o)}>
                <h3>{title}</h3>
                {total != null ? <span className="total">{total}</span> : null}
                <CollapseIcon type="chevron-down" opened={isOpened} />
            </Header>
            {isOpened ? <Content>{children}</Content> : null}
        </Wrapper>
    );
};

export default ChartCollapse;
