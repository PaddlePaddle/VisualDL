import Title from '~/components/Title';
import Content from '~/components/Content';
import {useTranslation} from '~/utils/i18n';

const HighDimension = () => {
    const {t} = useTranslation(['highDimension', 'common']);

    const aside = <section></section>;

    return (
        <>
            <Title>{t('common:highDimension')}</Title>
            <Content aside={aside}></Content>
        </>
    );
};

HighDimension.getInitialProps = () => {
    return {
        namespacesRequired: ['highDimension', 'common']
    };
};

export default HighDimension;
