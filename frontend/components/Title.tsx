import React, {FunctionComponent} from 'react';
import Head from 'next/head';
import capitalize from 'lodash/capitalize';

const Title: FunctionComponent = ({children: title}) => (
    <Head>
        <title>
            {'string' === typeof title ? `${capitalize(title)} - ` : ''}
            {process.env.title}
        </title>
    </Head>
);

export default Title;
