import React, {FunctionComponent} from 'react';
import Head from 'next/head';

type PreloaderProps = {
    url: string;
};

const Preloader: FunctionComponent<PreloaderProps> = ({url}) => (
    <Head>
        <link rel="preload" href={process.env.API_URL + url} as="fetch" crossOrigin="anonymous" />
    </Head>
);

export default Preloader;
