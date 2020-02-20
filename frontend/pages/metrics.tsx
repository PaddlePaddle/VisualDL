import React, {useState} from 'react';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {Tag} from '~/types';
import Title from '~/components/Title';
import Content from '~/components/Content';
import TagFilter from '~/components/TagFilter';

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

    const aside = <div>{t('metrics')}</div>;

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
