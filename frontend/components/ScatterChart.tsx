import React, {FunctionComponent, useEffect, useMemo} from 'react';
import styled from 'styled-components';
import GridLoader from 'react-spinners/GridLoader';
import {WithStyled, primaryColor} from '~/utils/style';
import useECharts from '~/hooks/useECharts';

const Wrapper = styled.div`
    position: relative;

    > .echarts {
        height: 100%;
    }

    > .loading {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
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
    const {ref, echart} = useECharts<HTMLDivElement>({
        loading,
        gl
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            echart?.current?.setOption(chartOptions as any, {notMerge: true});
        }
    }, [chartOptions, echart]);

    return (
        <Wrapper className={className}>
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
