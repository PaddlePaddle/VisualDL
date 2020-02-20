import React from 'react';
import {WithTranslation} from 'next-i18next';
import {withTranslation} from '~/utils/i18n';
import {Tag} from '~/types';
import Title from '~/components/Title';
import Content from '~/components/Content';
import TagFilter from '~/components/TagFilter';

type MetricsProps = {
    tags: Tag[];
    total: number;
};

class Metrics extends React.Component<MetricsProps & WithTranslation> {
    static getInitialProps() {
        return {
            namespacesRequired: ['common', 'metrics'],
            tags: [
                {label: 'test', count: 12},
                {label: 'asdfa', count: 2}
            ],
            total: 123
        };
    }

    state = {
        total: this.props.total
    };

    onChangeTagFilter = (value: string) => {
        console.log(value);
        this.setState({total: Math.floor(Math.random() * 100)});
    };

    aside() {
        return <div>{this.props.t('metrics')}</div>;
    }

    render() {
        const {t, tags} = this.props;
        const {total} = this.state;
        return (
            <>
                <Title>{t('metrics')}</Title>
                <Content aside={this.aside()}>
                    <TagFilter tags={tags} total={total} onChange={this.onChangeTagFilter}></TagFilter>
                </Content>
            </>
        );
    }
}

export default withTranslation(['common', 'metrics'])(Metrics);
