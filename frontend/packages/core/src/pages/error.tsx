import React, {FunctionComponent} from 'react';

import Content from '~/components/Content';
import ErrorComponent from '~/components/Error';
import {useTranslation} from 'react-i18next';

type ErrorProps = {
    title?: string;
    desc?: string;
};

const Error: FunctionComponent<ErrorProps> = ({title, desc, children}) => {
    const {t} = useTranslation('errors');

    return (
        <Content>
            <ErrorComponent>
                {children || (
                    <>
                        <h4>{title ?? t('errors:error')}</h4>
                        <p>{desc}</p>
                    </>
                )}
            </ErrorComponent>
        </Content>
    );
};

export default Error;
