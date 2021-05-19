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

import React, {FunctionComponent, useCallback, useMemo} from 'react';
import {calculateRelativeTime, chartData} from '~/resource/hyper-parameter';
import {formatTime, humanizeDuration} from '~/utils';

import type {MetricData} from '~/resource/hyper-parameter';
import type {Run} from '~/types';
import SChart from '~/components/ScalarChart';
import {format} from 'd3-format';
import queryString from 'query-string';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

const valueFormatter = format('.5');

const Error = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

interface ScalarChartProps {
    metric: string;
    run: Run;
}

const ScalarChart: FunctionComponent<ScalarChartProps> = ({metric, run}) => {
    const {t, i18n} = useTranslation(['hyper-parameter', 'common']);

    const {data, error, loading} = useRequest<MetricData[]>(
        queryString.stringifyUrl({url: '/hparams/metric', query: {run: run.label, metric}})
    );

    const dataWithRelativeTime = useMemo(() => calculateRelativeTime(data ?? []), [data]);

    const series = useMemo(() => chartData(dataWithRelativeTime, run), [dataWithRelativeTime, run]);

    const getTooltipTableData = useCallback(
        (series: number[]) => {
            return {
                runs: [run],
                columns: [
                    {
                        label: t('common:scalar-value'),
                        width: '4.285714286em'
                    },
                    {
                        label: t('common:time-mode.step'),
                        width: '2.857142857em'
                    },
                    {
                        label: t('common:time-mode.wall'),
                        width: '10.714285714em'
                    },
                    {
                        label: t('common:time-mode.relative'),
                        width: '4.285714286em'
                    }
                ],
                data: [
                    [
                        valueFormatter(series[2] ?? Number.NaN),
                        series[1],
                        formatTime(series[0], i18n.language),
                        humanizeDuration(series[3])
                    ]
                ]
            };
        },
        [i18n.language, run, t]
    );

    if (!data && error) {
        return <Error>{t('common:error')}</Error>;
    }

    return <SChart title={metric} data={series} loading={loading} getTooltipTableData={getTooltipTableData} />;
};

export default ScalarChart;
