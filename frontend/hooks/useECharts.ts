import {useRef, useEffect, useCallback, useState, MutableRefObject} from 'react';
import {ECharts} from 'echarts';
import {primaryColor, textColor, maskColor} from '~/utils/style';

const useECharts = <T extends HTMLElement>(options: {
    loading?: boolean;
    gl?: boolean;
    zoom?: boolean;
}): {
    ref: MutableRefObject<T | null>;
    echart: MutableRefObject<ECharts | null> | null;
} => {
    const ref = useRef(null as T | null);
    const echartInstance = useRef(null as ECharts | null);
    const [echart, setEchart] = useState(null as typeof echartInstance | null);

    const createChart = useCallback(() => {
        (async () => {
            const echarts = await import('echarts');
            if (options.gl) {
                await import('echarts-gl');
            }
            echartInstance.current = echarts.init((ref.current as unknown) as HTMLDivElement);
            if (options.zoom) {
                setTimeout(() => {
                    echartInstance.current?.dispatchAction({
                        type: 'takeGlobalCursor',
                        key: 'dataZoomSelect',
                        dataZoomSelectActive: true
                    });
                }, 0);
            }
            setEchart(echartInstance);
        })();
    }, [options.gl, options.zoom]);

    const destroyChart = useCallback(() => {
        echartInstance.current?.dispose();
        setEchart(null);
    }, []);

    useEffect(() => {
        if (process.browser) {
            createChart();
            return () => destroyChart();
        }
    }, [createChart, destroyChart]);

    useEffect(() => {
        if (process.browser && echart) {
            if (options.loading) {
                echartInstance.current?.showLoading('default', {
                    text: '',
                    color: primaryColor,
                    textColor,
                    maskColor,
                    zlevel: 0
                });
            } else {
                echartInstance.current?.hideLoading();
            }
        }
    }, [options.loading, echart]);

    return {ref, echart};
};

export default useECharts;
