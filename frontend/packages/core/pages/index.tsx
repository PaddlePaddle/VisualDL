import {NextI18NextPage, Router} from '~/utils/i18n';
import React, {useEffect} from 'react';
import {headerHeight, primaryColor, size} from '~/utils/style';

import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import useNavItems from '~/hooks/useNavItems';

const Loading = styled.div`
    ${size(`calc(100vh - ${headerHeight})`, '100vw')}
    display: flex;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
`;

const Index: NextI18NextPage = () => {
    const navItmes = useNavItems();

    useEffect(() => {
        if (navItmes.length) {
            Router.replace(`/${navItmes[0]}`);
        }
    }, [navItmes]);

    return (
        <Loading>
            <HashLoader size="60px" color={primaryColor} />
        </Loading>
    );
};

Index.getInitialProps = () => {
    return {
        namespacesRequired: []
    };
};

export default Index;
