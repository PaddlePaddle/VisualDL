import React from 'react';
import PropTypes from 'prop-types';
import {WithTranslation} from 'next-i18next';
import {withTranslation} from '~/utils/i18n';
import {withLayout} from '~/components/Layout';

class Samples extends React.Component<WithTranslation> {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return <div>Hello world!</div>;
    }

    static getInitialProps() {
        return {
            namespacesRequired: ['common', 'samples']
        };
    }
}

class SamplesSide extends React.Component<WithTranslation> {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        return <div>Hello world!</div>;
    }

    static getInitialProps() {
        return {
            namespacesRequired: ['common', 'samples']
        };
    }
}

export default withLayout(
    withTranslation(['common', 'samples'])(Samples),
    withTranslation(['common', 'samples'])(SamplesSide)
);
