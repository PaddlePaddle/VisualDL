import type {ColumnsType} from 'antd/lib/table';
import React from 'react';
import type {EChartsOption} from 'echarts';
export const options: EChartsOption = {
    grid: {
        left: '0',
        right: '0',
        bottom: '30',
        top: '62',
        containLabel: true
    },
    yAxis: {
        name: ''
    },
    dataZoom: [
        //给x轴设置滚动条
        {
            start: 0, //默认为0
            end: 20, //默认为100
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            handleSize: 0, //滑动条的 左右2个滑动条的大小
            height: 8, //组件高度
            left: 50, //左边的距离
            right: 40, //右边的距离
            bottom: 10, //右边的距离
            // handleColor: '#ddd', //h滑动图标的颜色
            handleStyle: {
                borderColor: '#cacaca',
                borderWidth: 1,
                shadowBlur: 2,
                // background: '#ddd',
                shadowColor: '#ddd'
            },
            fillerColor: '#2932E1',
            backgroundColor: '#ddd', //两边未选中的滑动条区域的颜色
            showDataShadow: false, //是否显示数据阴影 默认auto
            showDetail: false, //即拖拽时候是否显示详细数值信息 默认true
            // handleIcon:
            //     'M-292,322.2c-3.2,0-6.4-0.6-9.3-1.9c-2.9-1.2-5.4-2.9-7.6-5.1s-3.9-4.8-5.1-7.6c-1.3-3-1.9-6.1-1.9-9.3c0-3.2,0.6-6.4,1.9-9.3c1.2-2.9,2.9-5.4,5.1-7.6s4.8-3.9,7.6-5.1c3-1.3,6.1-1.9,9.3-1.9c3.2,0,6.4,0.6,9.3,1.9c2.9,1.2,5.4,2.9,7.6,5.1s3.9,4.8,5.1,7.6c1.3,3,1.9,6.1,1.9,9.3c0,3.2-0.6,6.4-1.9,9.3c-1.2,2.9-2.9,5.4-5.1,7.6s-4.8,3.9-7.6,5.1C-285.6,321.5-288.8,322.2-292,322.2z',
            filterMode: 'filter'
        }
    ]
};
