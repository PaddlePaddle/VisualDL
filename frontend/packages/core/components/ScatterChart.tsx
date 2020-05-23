import React, {FunctionComponent, useEffect, useMemo} from 'react';
import {WithStyled, backgroundColor, position, primaryColor, size} from '~/utils/style';

import GridLoader from 'react-spinners/GridLoader';
import styled from 'styled-components';
import useECharts from '~/hooks/useECharts';

const Wrapper = styled.div`
    position: relative;
    background-color: ${backgroundColor};

    > .echarts {
        height: 100%;
    }

    > .loading {
        ${position('absolute', 0, null, null, 0)}
        ${size('100%')}
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

const SYMBOL_SIZE = 12;

const options2D = {
    xAxis: {},
    yAxis: {},
    toolbox: {
        show: true,
        showTitle: false,
        itemSize: 0,

        feature: {
            dataZoom: {},
            restore: {},
            saveAsImage: {}
        }
    }
};

const options3D = {
    grid3D: {},
    xAxis3D: {},
    yAxis3D: {},
    zAxis3D: {}
};

const series2D = {
    symbolSize: SYMBOL_SIZE,
    type: 'scatter'
};

const series3D = {
    symbolSize: SYMBOL_SIZE,
    type: 'scatter3D'
};

type ScatterChartProps = {
    loading?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: Record<string, any>[];
    gl?: boolean;
};

const ScatterChart: FunctionComponent<ScatterChartProps & WithStyled> = ({data, loading, gl, className}) => {
    const {ref, echart, wrapper} = useECharts<HTMLDivElement>({
        loading,
        gl,
        autoFit: true
    });

    const chartOptions = useMemo(
        () => ({
            ...(gl ? options3D : options2D),
            series:
                data?.map(series => ({
                    ...(gl ? series3D : series2D),
                    ...series
                })) ?? []
        }),
        [gl, data]
    );

    useEffect(() => {
        if (process.browser) {
            echart?.setOption(chartOptions);
        }
    }, [chartOptions, echart]);

    return (
        <Wrapper ref={wrapper} className={className}>
            {!echart && (
                <div className="loading">
                    <GridLoader color={primaryColor} size="10px" />
                </div>
            )}
            <div className="echarts" ref={ref}></div>
        </Wrapper>
    );
};

export default ScatterChart;
