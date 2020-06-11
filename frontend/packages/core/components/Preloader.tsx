import React, {FunctionComponent} from 'react';

import Head from 'next/head';

type PreloaderProps = {
    url: string;
    as?:
        | 'audio'
        | 'document'
        | 'embed'
        | 'fetch'
        | 'font'
        | 'image'
        | 'object'
        | 'script'
        | 'style'
        | 'track'
        | 'worker'
        | 'video';
};

const Preloader: FunctionComponent<PreloaderProps> = ({url, as}) =>
    process.env.API_TOKEN_KEY ? null : (
        <Head>
            <link rel="preload" href={process.env.API_URL + url} crossOrigin="anonymous" as={as || 'fetch'} />
        </Head>
    );

export default Preloader;
