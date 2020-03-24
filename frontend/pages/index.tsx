import {NextI18NextPage, Router} from '~/utils/i18n';

import {useEffect} from 'react';

const Index: NextI18NextPage = () => {
    useEffect(() => {
        Router.replace('/scalars');
    }, []);

    return null;
};

Index.getInitialProps = () => {
    return {
        namespacesRequired: ['common']
    };
};

export default Index;
