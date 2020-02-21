import {useEffect} from 'react';
import {NextI18NextPage, Router} from '~/utils/i18n';

const Index: NextI18NextPage = () => {
    useEffect(() => {
        Router.replace('/metrics');
    }, []);

    return null;
};

Index.getInitialProps = () => {
    return {
        namespacesRequired: []
    };
};

export default Index;
