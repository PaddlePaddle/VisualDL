import React, {FunctionComponent, useEffect} from 'react';
import {headerHeight, primaryColor, rem, size} from '~/utils/style';

import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import {useHistory} from 'react-router-dom';
import useNavItems from '~/hooks/useNavItems';
import {useTranslation} from 'react-i18next';

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

const IndexPage: FunctionComponent = () => {
    const navItems = useNavItems();
    const history = useHistory();

    const {t} = useTranslation('common');

    useEffect(() => {
        if (navItems.length) {
            if (navItems[0].path) {
                history.replace(navItems[0].path);
            } else if (navItems[0].children?.length && navItems[0].children[0].path) {
                history.replace(navItems[0].children[0].path);
            }
        }
    }, [navItems, history]);

    return (
        <Loading>
            <HashLoader size="60px" color={primaryColor} />
            <span>{t('common:loading')}</span>
        </Loading>
    );
};

export default IndexPage;
