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
];
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
];

export const title = {
    textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    top: 10,
    left: 15
};

export const tooltip = {
    trigger: 'axis',
    position: ['10%', '95%'],
    axisPointer: {
        type: 'cross',
        label: {
            show: true
        },
        lineStyle: {
            color: '#2932E1',
            type: 'dashed'
        },
        crossStyle: {
            color: '#2932E1',
            type: 'dashed'
        }
    }
};

export const toolbox = {
    show: true,
    orient: 'vertical',
    showTitle: false,
    top: 50,
    right: 8,
    feature: {
        saveAsImage: {
            show: true
        },
        dataZoom: {
            show: true
        },
        restore: {
            show: true
        }
    },
    tooltip: {
        show: true
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
    left: 50,
    top: 60,
    right: 50,
    bottom: 50
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
        color: '#666'
    },
    splitLine: {
        show: false
    },
    splitNumber: 5
};

export const yAxis = {
    type: 'value',
    splitNumber: 4,
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
        formatter: (v: number) => Number.parseFloat(v.toPrecision(5))
    },
    splitLine: {
        lineStyle: {
            color: '#EEE'
        }
    }
};

export const series = {
    type: 'line',
    showSymbol: false,
    hoverAnimation: false,
    animationDuration: 100,
    lineStyle: {
        width: 1.5
    }
};
