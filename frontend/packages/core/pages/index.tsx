import {NextI18NextPage, Router, useTranslation} from '~/utils/i18n';
import React, {useEffect} from 'react';
import {headerHeight, primaryColor, rem, size} from '~/utils/style';

import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import useNavItems from '~/hooks/useNavItems';

const Loading = styled.div`
    ${size(`calc(100vh - ${headerHeight})`, '100vw')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
    font-size: ${rem(16)};
    line-height: ${rem(60)};
`;

const Index: NextI18NextPage = () => {
    const navItems = useNavItems();

    const {t} = useTranslation('common');

    useEffect(() => {
        if (navItems.length) {
            if (navItems[0].path) {
                Router.replace(navItems[0].path);
            } else if (navItems[0].children?.length && navItems[0].children[0].path) {
                Router.replace(navItems[0].children[0].path);
            }
        }
    }, [navItems]);

    return (
        <Loading>
            <HashLoader size="60px" color={primaryColor} />
            <span>{t('common:loading')}</span>
        </Loading>
    );
};

Index.getInitialProps = () => {
    return {
        namespacesRequired: ['common']
    };
};

export default Index;
