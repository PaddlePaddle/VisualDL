import {MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {maskColor, position, primaryColor, size, textColor} from '~/utils/style';

import type {ECharts} from 'echarts';
import {dataURL2Blob} from '~/utils/image';
import {saveAs} from 'file-saver';
import styled from 'styled-components';

export type Options = {
    loading?: boolean;
    gl?: boolean;
    zoom?: boolean;
    autoFit?: boolean;
    onInit?: (echarts: ECharts) => unknown;
    onDispose?: (echarts: ECharts) => unknown;
};

const useECharts = <T extends HTMLElement, W extends HTMLElement = HTMLDivElement>(
    options: Options
): {
    ref: MutableRefObject<T | null>;
    wrapper: MutableRefObject<W | null>;
    echart: ECharts | null;
    saveAsImage: (filename?: string) => void;
} => {
    const ref = useRef<T | null>(null);
    const echartInstance = useRef<ECharts | null>(null);
    const [echart, setEchart] = useState<ECharts | null>(null);

    const onInit = useRef(options.onInit);
    const onDispose = useRef(options.onDispose);

    const hideTip = useCallback(() => echartInstance.current?.dispatchAction({type: 'hideTip'}), []);

    const createChart = useCallback(() => {
        (async () => {
            const {default: echarts} = await import('echarts');
            if (options.gl) {
                await import('echarts-gl');
            }
            if (!ref.current) {
                return;
            }
            echartInstance.current = echarts.init((ref.current as unknown) as HTMLDivElement);

            ref.current.addEventListener('mouseleave', hideTip);

            setTimeout(() => {
                if (options.zoom) {
                    echartInstance.current?.dispatchAction({
                        type: 'takeGlobalCursor',
                        key: 'dataZoomSelect',
                        dataZoomSelectActive: true
                    });
                }

                if (echartInstance.current) {
                    onInit.current?.(echartInstance.current);
                }
            }, 0);

            setEchart(echartInstance.current);
        })();
    }, [options.gl, options.zoom, hideTip]);

    const destroyChart = useCallback(() => {
        if (echartInstance.current) {
            onDispose.current?.(echartInstance.current);
        }
        echartInstance.current?.dispose();
        ref.current?.removeEventListener('mouseleave', hideTip);
        setEchart(null);
    }, [hideTip]);

    useEffect(() => {
        createChart();
        return destroyChart;
    }, [createChart, destroyChart]);

    useEffect(() => {
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
    }, [options.loading]);

    const wrapper = useRef<W | null>(null);
    useLayoutEffect(() => {
        if (options.autoFit) {
            const w = wrapper.current;
            if (w) {
                const observer = new ResizeObserver(() => {
                    echartInstance.current?.resize();
                });
                observer.observe(w);
                return () => observer.unobserve(w);
            }
        }
    }, [options.autoFit]);

    const saveAsImage = useCallback(
        (filename?: string) => {
            if (echart) {
                const blob = dataURL2Blob(echart.getDataURL({type: 'png', pixelRatio: 2, backgroundColor: '#FFF'}));
                saveAs(blob, `${filename?.replace(/[/\\?%*:|"<>]/g, '_') || 'chart'}.png`);
            }
        },
        [echart]
    );

    return {ref, echart, wrapper, saveAsImage};
};

export default useECharts;

export const Wrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: stretch;

    > .echarts {
        width: 100%;
    }

    > .loading {
        ${size('100%')}
        ${position('absolute', 0, null, null, 0)}
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;
