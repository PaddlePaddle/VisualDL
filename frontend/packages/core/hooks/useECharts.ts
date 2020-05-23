import {MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {maskColor, primaryColor, textColor} from '~/utils/style';

import {ECharts} from 'echarts';

const useECharts = <T extends HTMLElement, W extends HTMLElement = HTMLDivElement>(options: {
    loading?: boolean;
    gl?: boolean;
    zoom?: boolean;
    autoFit?: boolean;
}): {
    ref: MutableRefObject<T | null>;
    echart: MutableRefObject<ECharts | null> | null;
    wrapper: MutableRefObject<W | null>;
} => {
    const ref = useRef<T | null>(null);
    const echartInstance = useRef<ECharts | null>(null);
    const [echart, setEchart] = useState<typeof echartInstance | null>(null);

    const createChart = useCallback(() => {
        (async () => {
            const echarts = await import('echarts');
            if (options.gl) {
                await import('echarts-gl');
            }
            if (!ref.current) {
                return;
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

    const wrapper = useRef<W | null>(null);
    useLayoutEffect(() => {
        if (options.autoFit && process.browser && echart) {
            const w = wrapper.current;
            if (w) {
                const observer = new ResizeObserver(() => {
                    echartInstance.current?.resize();
                });
                observer.observe(w);
                return () => observer.unobserve(w);
            }
        }
    }, [options.autoFit, echart]);

    return {ref, echart, wrapper};
};

export default useECharts;
