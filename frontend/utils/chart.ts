export const color = ['#2932E1', '#25C9FF', '#981EFF', '#D8DAF6', '#E9F9FF', '#F3E8FF'];

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
        formatter: (v: number) => v.toString().slice(0, 5)
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
