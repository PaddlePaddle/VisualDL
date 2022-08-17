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

import {colors} from '~/utils/theme';
import {format} from 'd3-format';

export const color = [
    '#2932E1',
    '#00CC88',
    '#981EFF',
    '#066BFF',
    '#3AEB0D',
    '#E71ED5',
    '#25C9FF',
    '#0DEBB0',
    '#FF0287',
    '#00E2FF',
    '#00FF9D',
    '#D50505',
    '#FFAA00',
    '#A3EB0D',
    '#FF0900',
    '#FF6600',
    '#FFEA00',
    '#FE4A3B'
] as const;
export const colorAlt = [
    '#9498F0',
    '#66E0B8',
    '#CB8EFF',
    '#6AA6FF',
    '#89F36E',
    '#F178E6',
    '#7CDFFF',
    '#6EF3D0',
    '#FF80C3',
    '#7FF0FF',
    '#66FFC4',
    '#E66969',
    '#FFD47F',
    '#A3EB0D',
    '#E9F9FF',
    '#FFB27F',
    '#FFF266',
    '#FE9289'
] as const;

export const title = {
    textStyle: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold'
    },
    top: 10,
    left: 15
};

export const tooltip = {
    trigger: 'axis',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderColor: 'rgba(0, 0, 0, 0.75)',
    textStyle: {
        color: '#fff'
    },
    hideDelay: 100,
    enterable: false,
    axisPointer: {
        type: 'cross',
        label: {
            show: true
        },
        lineStyle: {
            color: colors.primary.default,
            type: 'dashed'
        },
        crossStyle: {
            color: colors.primary.default,
            type: 'dashed'
        }
    }
};

export const toolbox = {
    show: true,
    showTitle: false,
    itemSize: 0,
    feature: {
        saveAsImage: {
            show: true,
            type: 'png',
            pixelRatio: 2,
        },
        dataZoom: {
            show: false,
            xAxisIndex: 0,
        },
        restore: {
            show: true
        }
    }
};

export const legend = {
    top: 12,
    right: 15,
    itemWidth: 17,
    itemHeight: 5,
    textStyle: {
        fontSize: 14
    },
    icon: 'roundRect'
};

export const grid = {
    left: 60,
    top: 60,
    right: 30,
    bottom: 30
};

export const xAxis = {
    type: 'value',
    name: '',
    nameTextStyle: {
        fontSize: 12,
        color: '#666'
    },
    axisLine: {
        lineStyle: {
            color: '#CCC'
        }
    },
    axisTick: {
        show: false
    },
    axisLabel: {
        fontSize: 12,
        color: '#666',
        formatter: format('.4')
    },
    splitLine: {
        lineStyle: {
            color: '#EEE'
        }
    }
};

export const yAxis = {
    type: 'value',
    name: '',
    nameTextStyle: {
        fontSize: 12,
        color: '#666'
    },
    axisLine: {
        lineStyle: {
            color: '#CCC'
        }
    },
    axisTick: {
        show: false
    },
    axisLabel: {
        fontSize: 12,
        color: '#666',
        formatter: format('.4')
    },
    splitLine: {
        lineStyle: {
            color: '#EEE'
        }
    }
};

export const series = {
    // hoverAnimation: false,
    animationDuration: 100
};
