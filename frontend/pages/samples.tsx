import React from 'react';
import {WithTranslation} from 'next-i18next';
import {withTranslation} from '~/utils/i18n';
import Content from '~/components/Content';

class Samples extends React.Component<WithTranslation> {
    render() {
        return (
            <Content>
                <div>Hello samples!</div>
            </Content>
        );
    }

    static getInitialProps() {
        return {
            namespacesRequired: ['common']
        };
    }
}

export default withTranslation(['common'])(Samples);
