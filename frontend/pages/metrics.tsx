import React, {useState} from 'react';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {styled, rem} from '~/utils/style';
import {Tag} from '~/types';
import Title from '~/components/Title';
import Content from '~/components/Content';
import TagFilter from '~/components/TagFilter';
import Select from '~/components/Select';

const AsideTitle = styled.h3`
    font-size: ${rem(16)};
    line-height: ${rem(16)};
    margin-bottom: ${rem(10)};
`;

const StyledSelect = styled(Select)`
    width: ${rem(160)};
    margin-bottom: ${rem(10)};
`;

const Divider = styled.hr<{height?: string | number}>`
    background-color: transparent;
    margin: 0;
    border: none;
    height: ${({height}) => (height ? ('number' === height ? rem(height) : height) : rem(20))};
`;

type MetricsProps = {
    tags: Tag[];
    total: number;
};

const Metrics: NextI18NextPage<MetricsProps> = props => {
    const {t} = useTranslation(['common', 'metrics']);
    const {tags} = props;

    const [total, setTotal] = useState(props.total);
    const onChangeTagFilter = (value: string) => {
        console.log(value);
        setTotal(Math.floor(Math.random() * 100));
    };

    const aside = (
        <section>
            <AsideTitle>{t('select-display-data')}</AsideTitle>
            <StyledSelect list={['123', '456', '789']}></StyledSelect>
            <Divider />
        </section>
    );

    return (
        <>
            <Title>{t('metrics')}</Title>
            <Content aside={aside}>
                <TagFilter tags={tags} total={total} onChange={onChangeTagFilter}></TagFilter>
            </Content>
        </>
    );
};

Metrics.getInitialProps = () => {
    return {
        namespacesRequired: ['common', 'metrics'],
        tags: [
            {label: 'test', count: 12},
            {label: 'asdfa', count: 2}
        ],
        total: 123
    };
};

export default Metrics;
