import {useEffect} from 'react';
import {NextPage} from 'next';
import Router from 'next/router';

const Index: NextPage = () => {
    useEffect(() => {
        Router.replace('/scalars');
    }, []);

    return null;
};

export default Index;
