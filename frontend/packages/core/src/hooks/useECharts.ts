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

// cSpell:words zlevel

import {MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {position, primaryColor, size} from '~/utils/style';

import type {ECharts} from 'echarts';
import * as echarts from 'echarts';
// import * as echarts from 'echarts-gl';
import {dataURL2Blob} from '~/utils/image';
import {saveFile} from '~/utils/saveFile';
import styled from 'styled-components';
import {themes} from '~/utils/theme';
import useTheme from '~/hooks/useTheme';
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
    const [echart, setEchart] = useState<ECharts | null>(null);
    const theme = useTheme();

    const onInit = useRef(options.onInit);
    const onDispose = useRef(options.onDispose);

    const hideTip = useCallback(() => echart?.dispatchAction({type: 'hideTip'}), [echart]);

    const createChart = useCallback(() => {
        (async () => {
            if (!ref.current) {
                return;
            }
            const echartInstance = echarts.init(ref.current as unknown as HTMLDivElement);
            ref.current.addEventListener('mouseleave', hideTip);

            setTimeout(() => {
                if (options.zoom) {
                    echartInstance.dispatchAction({
                        type: 'takeGlobalCursor',
                        key: 'dataZoomSelect',
                        dataZoomSelectActive: true
                    });
                }
                if (echartInstance) {
                    onInit.current?.(echartInstance);
                }
            }, 0);

            setEchart(echartInstance);
        })();
    }, [options.gl, options.zoom, hideTip]);

    const destroyChart = useCallback(() => {
        if (echart) {
            onDispose.current?.(echart);
            echart.dispose();
            ref.current?.removeEventListener('mouseleave', hideTip);
            setEchart(null);
        }
    }, [hideTip, echart]);

    useEffect(() => {
        createChart();
        return destroyChart;
    }, [createChart, destroyChart]);

    useEffect(() => {
        if (options.loading) {
            echart?.showLoading('default', {
                text: '',
                color: primaryColor,
                textColor: themes[theme].textColor,
                maskColor: themes[theme].maskColor,
                zlevel: 0
            });
        } else {
            echart?.hideLoading();
        }
    }, [options.loading, theme, echart]);

    const wrapper = useRef<W | null>(null);
    useLayoutEffect(() => {
        if (options.autoFit) {
            const w = wrapper.current;
            if (w) {
                let animationId: number | null = null;
                const observer = new ResizeObserver(() => {
                    if (animationId != null) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                    animationId = requestAnimationFrame(() => {
                        echart?.resize();
                    });
                });
                observer.observe(w);
                return () => observer.unobserve(w);
            }
        }
    }, [options.autoFit, echart]);

    const saveAsImage = useCallback(
        (filename?: string) => {
            if (echart) {
                const blob = dataURL2Blob(echart.getDataURL({type: 'png', pixelRatio: 2, backgroundColor: '#FFF'}));
                saveFile(blob, `${filename || 'chart'}.png`);
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

export const useChartTheme = (gl?: boolean) => {
    const theme = useTheme();
    const tt = useMemo(() => themes[theme], [theme]);
    const result = useMemo(() => {
        if (gl) {
            return {
                title: {
                    textStyle: {
                        color: tt.textColor
                    }
                },
                tooltip: {
                    backgroundColor: tt.tooltipBackgroundColor,
                    borderColor: tt.tooltipBackgroundColor,
                    textStyle: {
                        color: tt.tooltipTextColor
                    }
                },
                xAxis3D: {
                    nameTextStyle: {
                        color: tt.textLightColor
                    },
                    axisLabel: {
                        color: tt.textLightColor
                    },
                    axisLine: {
                        lineStyle: {
                            color: tt.borderColor
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: tt.borderColor
                        }
                    }
                },
                yAxis3D: {
                    nameTextStyle: {
                        color: tt.textLightColor
                    },
                    axisLabel: {
                        color: tt.textLightColor
                    },
                    axisLine: {
                        lineStyle: {
                            color: tt.borderColor
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: tt.borderColor
                        }
                    }
                },
                zAxis3D: {
                    nameTextStyle: {
                        color: tt.textLightColor
                    },
                    axisLabel: {
                        color: tt.textLightColor
                    },
                    axisLine: {
                        lineStyle: {
                            color: tt.borderColor
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: tt.borderColor
                        }
                    }
                }
            };
        }
        return {
            title: {
                textStyle: {
                    color: tt.textColor
                }
            },
            tooltip: {
                backgroundColor: tt.tooltipBackgroundColor,
                borderColor: tt.tooltipBackgroundColor,
                textStyle: {
                    color: tt.tooltipTextColor
                }
            },
            xAxis: {
                nameTextStyle: {
                    color: tt.textLightColor
                },
                axisLabel: {
                    color: tt.textLightColor
                },
                axisLine: {
                    lineStyle: {
                        color: tt.borderColor
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: tt.borderColor
                    }
                }
            },
            yAxis: {
                nameTextStyle: {
                    color: tt.textLightColor
                },
                axisLabel: {
                    color: tt.textLightColor
                },
                axisLine: {
                    lineStyle: {
                        color: tt.borderColor
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: tt.borderColor
                    }
                }
            }
        };
    }, [tt, gl]);
    return result;
};
