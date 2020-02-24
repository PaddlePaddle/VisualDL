import React, {FunctionComponent} from 'react';
import useSWR from 'swr';
import {cycleFetcher} from '~/utils/fetch';
import smooth from '~/utils/smooth';
import {series} from '~/utils/chart';
import LineChart from '~/components/LineChart';

type DataSet = number[][];

type ScalarChartProps = {
    runs: string[];
    tag: string;
    smoothing: number;
};

const ScalarChart: FunctionComponent<ScalarChartProps> = ({runs, tag, smoothing}) => {
    // TODO: maybe we can create a custom hook here
    const {data: datasets} = useSWR<DataSet[]>(
        runs.map(run => `/scalars/scalars?run=${encodeURIComponent(run)}&tag=${encodeURIComponent(tag)}`),
        (...urls) => cycleFetcher(urls)
    );

    const data = datasets
        ?.map((dataset, i) => [
            {
                name: runs[i],
                z: i,
                lineStyle: {
                    width: series.lineStyle.width,
                    opacity: 0.5
                },
                data: dataset,
                encode: {
                    x: [1],
                    y: [2]
                }
            },
            {
                name: runs[i],
                z: runs.length + i,
                data: smooth(dataset, smoothing),
                encode: {
                    x: [1],
                    y: [3]
                }
            }
        ])
        .flat();

    return <LineChart title={tag} data={data} />;
};

export default ScalarChart;
