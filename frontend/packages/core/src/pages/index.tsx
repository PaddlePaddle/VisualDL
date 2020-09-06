import React, {FunctionComponent, useEffect} from 'react';
import {headerHeight, primaryColor, rem, size} from '~/utils/style';
import {useHistory, useLocation} from 'react-router-dom';

import Error from '~/components/Error';
import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import useNavItems from '~/hooks/useNavItems';
import {useTranslation} from 'react-i18next';

const CenterWrapper = styled.div`
    ${size(`calc(100vh - ${headerHeight})`, '100vw')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
`;

const Loading = styled.div`
    font-size: ${rem(16)};
    line-height: ${rem(60)};
`;

const IndexPage: FunctionComponent = () => {
    const [navItems, loading] = useNavItems();
    const history = useHistory();

    const {t} = useTranslation('common');

    const location = useLocation();

    useEffect(() => {
        if (navItems.length) {
            if (navItems[0].path) {
                history.replace(navItems[0].path + location.search);
            } else if (navItems[0].children?.length && navItems[0].children[0].path) {
                history.replace(navItems[0].children[0].path + location.search);
            }
        }
    }, [navItems, history, location.search]);

    return (
        <CenterWrapper>
            {loading || navItems.length ? (
                <Loading>
                    <HashLoader size="60px" color={primaryColor} />
                    <span>{t('common:loading')}</span>
                </Loading>
            ) : (
                <Error />
            )}
        </CenterWrapper>
    );
};

export default IndexPage;
