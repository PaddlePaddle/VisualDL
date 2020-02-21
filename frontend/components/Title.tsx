import React, {FunctionComponent} from 'react';
import Head from 'next/head';

const Title: FunctionComponent = ({children: title}) => (
    <Head>
        <title>
            {'string' === typeof title ? `${title} - ` : ''}
            {process.env.title}
        </title>
    </Head>
);

export default Title;
