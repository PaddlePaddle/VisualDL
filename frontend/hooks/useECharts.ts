import {useRef, useEffect, useCallback, MutableRefObject} from 'react';
import echarts, {ECharts} from 'echarts';
import {useTranslation} from '~/utils/i18n';

const useECharts = <T extends HTMLElement>(
    loading: boolean
): [MutableRefObject<T | null>, MutableRefObject<ECharts | null>] => {
    const {t} = useTranslation('common');
    const ref = useRef(null);
    const echart = useRef(null as ECharts | null);

    const createChart = useCallback(() => {
        echart.current = echarts.init((ref.current as unknown) as HTMLDivElement);
    }, []);

    const destroyChart = useCallback(() => {
        echart.current?.dispose();
    }, []);

    useEffect(() => {
        if (process.browser) {
            createChart();
            return () => destroyChart();
        }
    }, [createChart, destroyChart]);

    useEffect(() => {
        if (process.browser) {
            if (loading) {
                echart.current?.showLoading('default', {
                    text: t('loading'),
                    color: '#c23531',
                    textColor: '#000',
                    maskColor: 'rgba(255, 255, 255, 0.8)',
                    zlevel: 0
                });
            } else {
                echart.current?.hideLoading();
            }
        }
    }, [t, loading]);

    return [ref, echart];
};

export default useECharts;
