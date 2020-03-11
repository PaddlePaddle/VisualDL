import React, {FunctionComponent, useMemo} from 'react';
import styled from 'styled-components';
import queryString from 'query-string';
import {rem, primaryColor} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
import {useRunningRequest} from '~/hooks/useRequest';
import useHeavyWork from '~/hooks/useHeavyWork';
import {divide, Dimension, Reduction, DivideParams, Point} from '~/resource/high-dimensional';
import ScatterChart from '~/components/ScatterChart';

const height = rem(600);

const divideWasm = () =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    import('~/wasm/dist').then(({divide}) => (params: DivideParams) =>
        (divide(params.points, params.labels, !!params.visibility, params.keyword ?? '') as unknown) as [
            Point[],
            Point[]
        ]
    );
const divideWorker = () => new Worker('~/worker/high-dimensional/divide.worker.ts', {type: 'module'});

const StyledScatterChart = styled(ScatterChart)`
    height: ${height};
`;

const Empty = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${rem(20)};
    height: ${height};
`;

const label = {
    show: true,
    position: 'top',
    formatter: (params: {data: {name: string; showing: boolean}}) => (params.data.showing ? params.data.name : '')
};

type Data = {
    embedding: ([number, number] | [number, number, number])[];
    labels: string[];
};

type HighDimensionalChartProps = {
    run: string;
    running?: boolean;
    labelVisibility?: boolean;
    reduction: Reduction;
    keyword: string;
    dimension: Dimension;
};

const HighDimensionalChart: FunctionComponent<HighDimensionalChartProps> = ({
    run,
    running,
    labelVisibility,
    keyword,
    reduction,
    dimension
}) => {
    const {t} = useTranslation('common');

    const {data, error, loading} = useRunningRequest<Data>(
        `/embeddings/embedding?${queryString.stringify({
            run: run ?? '',
            dimension: Number.parseInt(dimension),
            reduction
        })}`,
        !!running
    );

    const divideParams = useMemo(
        () => ({
            points: data?.embedding ?? [],
            keyword,
            labels: data?.labels ?? [],
            visibility: labelVisibility
        }),
        [data, labelVisibility, keyword]
    );
    const points = useHeavyWork(divideWasm, divideWorker, divide, divideParams);

    const chartData = useMemo(() => {
        return [
            {
                name: 'highlighted',
                data: points?.[0] ?? [],
                label
            },
            {
                name: 'others',
                data: points?.[1] ?? [],
                label,
                color: primaryColor
            }
        ];
    }, [points]);

    if (!data && error) {
        return <Empty>{t('error')}</Empty>;
    }

    if (!data && !loading) {
        return <Empty>{t('empty')}</Empty>;
    }

    return <StyledScatterChart loading={loading} data={chartData} gl={dimension === '3d'} />;
};

export default HighDimensionalChart;
