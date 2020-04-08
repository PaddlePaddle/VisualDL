import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import {headerHeight, rem} from '~/utils/style';

import styled from 'styled-components';

const Error = styled.div`
    height: calc(100vh - ${headerHeight});
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${rem(20)};
`;

const Error404: NextI18NextPage = () => {
    const {t} = useTranslation('errors');

    return <Error>404 - {t('page-not-found')}</Error>;
};

// 404 page cannot have getInitialProps or getServerSideProps
// we need next-i18next support getStaticProps
// https://github.com/zeit/next.js/blob/master/errors/404-get-initial-props.md
// https://github.com/isaachinman/next-i18next/issues/652
// Error404.getInitialProps = () => {
//     return {
//         namespacesRequired: ['errors']
//     };
// };

export default Error404;
