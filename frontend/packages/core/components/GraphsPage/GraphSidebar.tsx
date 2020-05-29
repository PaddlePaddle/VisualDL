import React, {FunctionComponent} from 'react';
import {backgroundColor, borderColor, rem, textLightColor} from '~/utils/style';

import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const Sidebar = styled.div`
    height: 100%;
    background-color: ${backgroundColor};
`;

const Title = styled.div`
    height: ${rem(60)};
    font-size: ${rem(16)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${borderColor};
    margin: 0 ${rem(20)};

    > .close {
        flex: 0 0 auto;
        color: ${textLightColor};
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
