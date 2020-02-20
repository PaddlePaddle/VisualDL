import React from 'react';
import {WithTranslation} from 'next-i18next';
import {withTranslation, Router} from '~/utils/i18n';

class Index extends React.Component<WithTranslation> {
    static getInitialProps() {
        return {
            namespacesRequired: ['common']
        };
    }

    render() {
        return null;
    }

    componentDidMount() {
        Router.replace('/metrics');
    }
}

export default withTranslation('common')(Index);
