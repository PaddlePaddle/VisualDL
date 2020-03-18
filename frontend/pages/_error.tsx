import styled from 'styled-components';
import {rem, headerHeight} from '~/utils/style';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';

const ErrorDiv = styled.div`
    height: calc(100vh - ${headerHeight});
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${rem(20)};
`;

interface ErrorProps {
    statusCode?: number | null;
}

const Error: NextI18NextPage<ErrorProps> = ({statusCode}) => {
    const {t} = useTranslation('errors');

    return <ErrorDiv>{statusCode ? t('error-with-status', {statusCode}) : t('error-without-status')}</ErrorDiv>;
};

Error.getInitialProps = ({res, err}) => {
    let statusCode = null;
    if (res) {
        ({statusCode} = res);
    } else if (err) {
        ({statusCode} = err);
    }
    return {
        namespacesRequired: ['errors'],
        statusCode
    };
};

export default Error;
