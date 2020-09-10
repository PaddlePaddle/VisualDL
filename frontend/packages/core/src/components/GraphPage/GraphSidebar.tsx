import React, {FunctionComponent} from 'react';

import {rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Sidebar = styled.div`
    height: 100%;
    background-color: var(--background-color);
`;

const Title = styled.div`
    height: ${rem(60)};
    font-size: ${rem(16)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    margin: 0 ${rem(20)};

    > .close {
        flex: none;
        color: var(--text-light-color);
        cursor: pointer;
    }
`;

const Content = styled.div`
    padding: ${rem(20)};
    height: calc(100% - ${rem(60)});
    overflow: auto;
`;

type GraphSidebarProps = {
    title: string;
    onClose?: () => unknown;
};

const GraphSidebar: FunctionComponent<GraphSidebarProps> = ({title, onClose, children}) => {
    const {t} = useTranslation('common');

    return (
        <Sidebar>
            <Title>
                <span>{title}</span>
                <a className="close" onClick={() => onClose?.()}>
                    {t('common:close')}
                </a>
            </Title>
            <Content>{children}</Content>
        </Sidebar>
    );
};

export default GraphSidebar;
