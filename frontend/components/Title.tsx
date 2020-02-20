import React from 'react';
import Head from 'next/head';
import capitalize from 'lodash/capitalize';

export default class Title extends React.Component {
    render() {
        const title = this.props.children;
        return (
            <Head>
                <title>{'string' === typeof title ? `${capitalize(title)} - ` : ''}{process.env.title}</title>
            </Head>
        );
    }
}
