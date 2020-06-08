import {Dimension, DivideParams, Point, Reduction, divide} from '~/resource/high-dimensional';
import React, {FunctionComponent, useMemo} from 'react';
import {contentHeight, primaryColor, rem} from '~/utils/style';

import ScatterChart from '~/components/ScatterChart';
import queryString from 'query-string';
import styled from 'styled-components';
import useHeavyWork from '~/hooks/useHeavyWork';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from '~/utils/i18n';

const divideWasm = () =>
    import('@visualdl/wasm').then(({divide}) => (params: DivideParams) =>
        (divide(params.points, params.labels, !!params.visibility, params.keyword ?? '') as unknown) as [
            Point[],
            Point[]
        ]
    );
const divideWorker = () => new Worker('~/worker/high-dimensional/divide.worker.ts', {type: 'module'});

const StyledScatterChart = styled(ScatterChart)`
    height: ${contentHeight};
`;

const Empty = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${rem(20)};
    height: ${contentHeight};
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
    tag: string;
    running?: boolean;
    labelVisibility?: boolean;
    reduction: Reduction;
    keyword: string;
    dimension: Dimension;
};

const HighDimensionalChart: FunctionComponent<HighDimensionalChartProps> = ({
    run,
    tag,
    running,
    labelVisibility,
    keyword,
    reduction,
    dimension
}) => {
    const {t} = useTranslation('common');

    const {data, error, loading} = useRunningRequest<Data>(
        run && tag
            ? `/embeddings/embedding?${queryString.stringify({
                  run,
                  tag,
                  dimension: Number.parseInt(dimension, 10),
                  reduction
              })}`
            : null,
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
        return <Empty>{t('common:error')}</Empty>;
    }

    if (!data && !loading) {
        return <Empty>{t('common:empty')}</Empty>;
    }

    return <StyledScatterChart loading={loading} data={chartData} gl={dimension === '3d'} />;
};

export default HighDimensionalChart;
