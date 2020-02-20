import React from 'react';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import Content from '~/components/Content';

const Samples: NextI18NextPage = () => {
    const {t} = useTranslation(['common', 'samples']);

    return (
        <Content>
            <div>Hello {t('samples')}!</div>
        </Content>
    );
};

Samples.getInitialProps = () => {
    return {
        namespacesRequired: ['common', 'samples']
    };
};

export default Samples;
