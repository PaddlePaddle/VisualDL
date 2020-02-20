import React from 'react';
import PropTypes from 'prop-types';
import {WithTranslation} from 'next-i18next';
import {withTranslation} from '~/utils/i18n';
import Title from '~/components/Title';
import Content from '~/components/Content';

class Metrics extends React.Component<WithTranslation> {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    aside() {
        return <div>{this.props.t('metrics')}</div>;
    }

    render() {
        const {t} = this.props;
        return (
            <>
                <Title>{t('metrics')}</Title>
                <Content aside={this.aside()}>
                    <div>Hello metrics!</div>
                </Content>
            </>
        );
    }

    static getInitialProps() {
        return {
            namespacesRequired: ['common', 'metrics']
        };
    }
}

export default withTranslation(['common', 'metrics'])(Metrics);
