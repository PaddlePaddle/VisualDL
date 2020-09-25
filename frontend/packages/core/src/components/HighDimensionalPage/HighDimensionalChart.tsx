/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {Dimension, Reduction} from '~/resource/high-dimensional';
import React, {FunctionComponent, useMemo} from 'react';
import {contentHeight, primaryColor, rem} from '~/utils/style';

import ScatterChart from '~/components/ScatterChart';
import {divide} from '~/resource/high-dimensional';
import type {high_dimensional_divide} from '@visualdl/wasm'; // eslint-disable-line @typescript-eslint/no-unused-vars
import queryString from 'query-string';
import styled from 'styled-components';
import useHeavyWork from '~/hooks/useHeavyWork';
import {useRunningRequest} from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';
import wasm from '~/utils/wasm';

const divideWasm = () =>
    wasm<typeof high_dimensional_divide>(
        'high_dimensional_divide'
    ).then((high_dimensional_divide): typeof divide => params =>
        high_dimensional_divide(params.points, params.labels, !!params.visibility, params.keyword ?? '')
    );
// const divideWorker = () => new Worker('~/worker/high-dimensional/divide.worker.ts', {type: 'module'});

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
            ? `/embedding/embedding?${queryString.stringify({
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
    const points = useHeavyWork(divideWasm, null, divide, divideParams);

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
