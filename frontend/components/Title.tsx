import React from 'react';
import Head from 'next/head';

export default class Title extends React.Component {
    render() {
        const title = this.props.children;
        return (
            <Head>
                <title>{title ? `${title} - ` : ''}Visual DL</title>
            </Head>
        );
    }
}
