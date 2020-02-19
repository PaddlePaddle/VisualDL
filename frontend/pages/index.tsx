import React from 'react';
import PropTypes from 'prop-types';
import {WithTranslation} from 'next-i18next';
import {withTranslation, Router} from '~/utils/i18n';

class Index extends React.Component<WithTranslation> {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return null;
    }

    componentDidMount() {
        Router.replace('/metrics');
    }

    static getInitialProps() {
        return {
            namespacesRequired: ['common']
        };
    }
}

export default withTranslation('common')(Index);
