import React from 'react';
import PropTypes from 'prop-types';
import {WithTranslation} from 'next-i18next';
import {withTranslation} from '~/utils/i18n';
import {withLayout} from '~/components/Layout';

class Metrics extends React.Component<WithTranslation> {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return <div>Hello world!</div>;
    }

    static getInitialProps() {
        return {
            namespacesRequired: ['common', 'metrics']
        };
    }
}

class MetricsSide extends React.Component<WithTranslation> {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return <div>Hello world!</div>;
    }

    static getInitialProps() {
        return {
            namespacesRequired: ['common', 'metrics']
        };
    }
}

export default withLayout(
    withTranslation(['common', 'metrics'])(Metrics),
    withTranslation(['common', 'metrics'])(MetricsSide)
);
