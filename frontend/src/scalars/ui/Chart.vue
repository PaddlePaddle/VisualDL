<template>
    <div class="visual-dl-page-charts">
        <div ref="chartBox" class="visual-dl-chart-box" :style="computedStyle">
        </div>
        <div class="visual-dl-chart-actions">
            <v-btn flat @click="expandArea" class="chart-expand">
                <v-icon size="20">settings_overscan</v-icon>
            </v-btn>
            <v-select
                v-if="downloadLink"
                class="download-selector"
                :items="runsItems"
                v-model="downloadType"
                item-text="name"
                item-value="value"
            />
            <v-btn flat
                v-if="downloadLink"
                class="download-button"
                @click="handleDownLoad">
                <v-icon size="20">file_download</v-icon>
            </v-btn>
        </div>
    </div>
</template>
<script>
import('vuetify/dist/vuetify.min.css')

// TODO: Consider create Vue Components for these

// // components
// import Button from 'san-mui/Button';
// import Icon from 'san-mui/Icon';
// import DropDownMenu from '../../common/component/DropDownMenu';

// libs
import echarts from 'echarts';
import axios from 'axios';
import {isFinite, flatten, maxBy, minBy, sortBy, max, min} from 'lodash';
import {generateJsonAndDownload} from '../../common/util/downLoadFile';
import {quantile} from '../../common/util/index';
import moment from 'moment';

// service
import {getPluginScalarsScalars} from '../../service';

const originLinesOpacity = 0.3;
const defaultSmoothWeight = 0.6;
const lineWidth = 1.5;
const minQuantile = 0.05;
const maxQuantile = 0.95;
// the time to refresh chart data
const intervalTime = 15;

export default {
    props: ['tagInfo', 'groupNameReg', 'smoothing', 'horizontal', 'sortingMethod', 'downloadLink', 'outlier', 'runs',
            'running', 'runsItems'],
    computed: {
        computedStyle() {
            return 'height:' + this.height + 'px;'
                + 'width:' + this.width + 'px;';
        }
    },
    data() {
        return {
            width: 400,
            height: 300,
            data: [
                {
                    name: 'train',
                    value: []
                }
            ],
            // choose run type for download file
            downloadType: {},
            isExpand: false,
            originData: []
        };
    },
    watch: {
        runsItems: function(val) {
            this.initDownloadType();
        },
        originData: function(val) {
            this.setChartData();
            this.setChartsOutlier();
            this.setChartHorizon();
        },
        smoothing: function(val) {
            this.setChartData();
        },
        outlier: function(val) {
            this.setChartsOutlier();
        },
        horizontal: function(val) {
            this.setChartHorizon();
        },
        tagInfo: function(val) {
            // Should Clean up the chart before each use.
            this.myChart.clear();
            this.setChartsOptions(val);
            this.getOriginChartData(val);
        }
        // runs: function(val) {
        //     this.setChartsRuns();
        // }
    },
    mounted() {
        this.initChart(this.tagInfo);

        if (this.running) {
            this.startInterval();
        }

        this.$watch('running', function(running) {
            running ? this.startInterval() : this.stopInterval();
        });
    },

    beforeDestroy() {
        this.stopInterval();
    },
    methods: {
        initDownloadType() {
            if (this.runsItems.length === 0) {
                return;
            }
            this.downloadType = this.runsItems[0];
        },

        // Create a Scalar Chart, initialize it with default settings, then load datas
        initChart(tagInfo) {
            this.createChart();
            this.setChartsOptions(tagInfo);
            this.getOriginChartData(tagInfo);
        },

        createChart() {
            let el = this.$refs.chartBox;
            this.myChart = echarts.init(el);
        },

        setChartsOptions({tagList, tag}) {
            // Create two lines, one line is original, the other line is for smoothing
            let seriesOption = tagList.map(item => [
                    {
                        name: item.run,
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        z: 0,
                        data: [],
                        animationDuration: 100,
                        lineStyle: {
                            normal: {
                                opacity: originLinesOpacity,
                                width: lineWidth
                            }
                        }
                    },
                    {
                        name: item.run,
                        type: 'line',
                        showSymbol: false,
                        hoverAnimation: false,
                        z: 1,
                        data: [],
                        animationDuration: 100,
                        lineStyle: {
                            normal: {
                                width: lineWidth
                            }
                        }
                    }
                ]
            );
            seriesOption = flatten(seriesOption);
            let legendOptions = tagList.map(item => item.run);
            let instance = this;
            let option = {
                color: [
                    '#c23531',
                    '#61a0a8',
                    '#d48265',
                    '#91c7ae',
                    '#749f83',
                    '#ca8622',
                    '#bda29a',
                    '#6e7074',
                    '#546570',
                    '#c4ccd3'
                ],
                title: {
                    text: tag,
                    textStyle: {
                        fontSize: '12',
                        fontFamily: 'Merriweather Sans'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        animation: true
                    },
                    position: ['10%', '90%'],
                    formatter(params, ticket, callback) {
                        let data = instance.getFormatterPoints(params[0].data);
                        return instance.transformFormatterData(data);
                    }
                },
                toolbox: {
                    show: true,
                    showTitle: true,
                    feature: {
                        dataZoom: {},
                        restore: {},
                        saveAsImage: {}
                    },
                    left: '10%',
                    top: '90%'
                },
                legend: {
                    data: legendOptions,
                    top: '10%'
                },
                grid: {
                    left: '10%',
                    top: '20%',
                    right: '10%',
                    bottom: '20%'
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter(value) {
                            return value.toString().slice(0, 5);
                        }
                    }
                },
                series: seriesOption
            };
            this.myChart.setOption(option);
        },

        // Get origin data per 60 seconds
        startInterval() {
            this.getOriginDataInterval = setInterval(() => {
                this.getOriginChartData(this.tagInfo);
            }, intervalTime * 1000);
        },

        stopInterval() {
            clearInterval(this.getOriginDataInterval);
        },

        getOriginChartData({tagList, tag}) {
            let requestList = tagList.map(item => {
                let params = {
                    run: item.run,
                    tag: tag
                };
                return getPluginScalarsScalars(params);
            });
            axios.all(requestList).then(resArray => {
                if (resArray.every(res => res.status === 0)) {
                    this.originData = resArray.map(res => res.data);
                }
            });
        },

        setChartData() {
            let seriesData = this.originData.map(lineData => {
                // add the smoothed data
                this.transformDataset(lineData);
                return [
                    {
                        data: lineData,
                        encode: {
                            // map 1 dimension to xAixs.
                            x: [1],
                            // map 2 dimension to yAixs.
                            y: [2]
                        }
                    },
                    {
                        data: lineData,
                        encode: {
                            // Map 1 dimension to xAixs.
                            x: [1],
                            // Map 3 dimension to yAixs,
                            // the third number is smoothed value.
                            y: [3]
                        }
                    }
                ];
            });
            this.myChart.setOption({
                series: flatten(seriesData)
            });
        },

        getChartOptions() {
            return this.myChart.getOption() || {};
        },
        handleDownLoad() {
            let options = this.getChartOptions();
            let series = options.series || [];
            let seriesItem = series.find(item => item.name === this.downloadType) || {};
            let fileName = this.tagInfo.tag.replace(/\//g, '-');
            generateJsonAndDownload(seriesItem.data, fileName);
        },

        transformDataset(seriesData) {
            // smooth
            this.transformData(seriesData, this.smoothing || defaultSmoothWeight);
        },

        /**
         * @desc 1、add smooth data depend on smoothingWeight. see https://en.wikipedia.org/wiki/Moving_average for detail
         *       2、add relative data
         * @param {Object} echarts series Object
         * @param {number} smoothingWeight smooth weight, between 0 ~ 1
         */
        transformData(seriesData, smoothingWeight) {
            let data = seriesData;
            let last = data.length > 0 ? 0 : NaN;
            let numAccum = 0;
            let startValue;
            data.forEach((d, i) => {
                let nextVal = d[2];
                // second to millisecond.
                let millisecond = Math.floor(d[0] * 1000);
                if (i === 0) {
                    startValue = millisecond;
                }
                // Relative time, millisecond to hours.
                d[4] = Math.floor(millisecond - startValue) / (60 * 60 * 1000);
                if (!isFinite(nextVal)) {
                    d[3] = nextVal;
                } else {
                    last = last * smoothingWeight + (1 - smoothingWeight) * nextVal;
                    numAccum++;
                    let debiasWeight = 1;
                    if (smoothingWeight !== 1.0) {
                        debiasWeight = 1.0 - Math.pow(smoothingWeight, numAccum);
                    }
                    d[3] = last / debiasWeight;
                }
            });
        },

        // Chart outlier options methods and functions ---- start.
        // Compute Y domain from originData.
        setChartsOutlier(seriesData) {
            let domainRangeArray = this.originData.map(seriesData => this.computeDataRange(seriesData, this.outlier));

            // Compare, get the best Y domain.
            let flattenNumbers = flatten(domainRangeArray);
            let finalMax = max(flattenNumbers);
            let finalMin = min(flattenNumbers);

            // Add padding.
            let PaddedYDomain = this.paddedYDomain(finalMin, finalMax);

            this.setChartOutlierOptions(PaddedYDomain);

            // Store Y domain, if originData is not change, Y domain keep same.

        },

        // Compute  max and min from array, if outlier is true, return quantile range.
        computeDataRange(arr, isQuantile) {
            // Get data range.
            let max;
            let min;
            if (!isQuantile) {
                // Get the orgin data range.
                max = maxBy(arr, item => item[2])[2];
                min = minBy(arr, item => item[2])[2];
            }
            else {
                // Get the quantile range.
                let sorted = sortBy(arr, [item => item[2]]);
                min = quantile(sorted, minQuantile, item => item[2]);
                max = quantile(arr, maxQuantile, item => item[2]);
            }
            return [min, max];
        },

        paddedYDomain(min, max) {
            return {
                max: max > 0 ? max * 1.1 : max * 0.9,
                min: min > 0 ? min * 0.9 : min * 1.1
            };
        },

        setChartOutlierOptions({min, max}) {
            this.myChart.setOption({
                yAxis: {
                    min,
                    max
                }
            });
        },

        // Chart horizontal options methods and functions ---- start.
        setChartHorizon() {
            let seriesOption = this.myChart.getOption().series;
            let encodeSeries = val => {
                return {
                    encode: {
                        x: [val]
                    }
                };
            };
            let stepSeries = seriesOption.map(item => encodeSeries(1));
            let relativeSeries = seriesOption.map(item => encodeSeries(4));
            let wallSeries = seriesOption.map(item => encodeSeries(0));
            let horizontalToxAxisOptions = {
                step: {
                    xAxis: {
                        type: 'value'
                    },
                    series: stepSeries
                },
                relative: {
                    xAxis: {
                        type: 'value'
                    },
                    series: relativeSeries
                },
                wall: {
                    xAxis: {
                        type: 'time'
                    },
                    series: wallSeries
                }
            };
            this.myChart.setOption(horizontalToxAxisOptions[this.horizontal]);
        },

        expandArea() {
            let pageBoxWidth = document.getElementsByClassName('visual-dl-chart-page-box')[0].offsetWidth;
            if (!this.isExpand) {
                let el = this.$refs.chartBox;
                el.style.width = pageBoxWidth + 'px';
                el.style.height = '600px';
                this.isExpand = true;
                this.myChart.resize({
                    width: pageBoxWidth,
                    height: 600
                });
            }
            else {
                let el = this.$refs.chartBox;
                el.style.width = '400px';
                el.style.height = '300px';
                this.isExpand = false;
                this.myChart.resize({
                    width: 400,
                    height: 300
                });
            }
        },

        getFormatterPoints(data) {
            let originData = this.originData;
            let tagList = this.tagInfo.tagList;
            let sortingMethod = this.sortingMethod;
            // Can't know exactly the tigger runs.
            // If the step is same, regard the point as the trigger point.
            let [, step, triggerValue] = data;
            let points = originData.map((series, index) => {
                let nearestItem;
                if (step === 0) {
                    nearestItem = series[0];

                }
                else {
                    for (let i = 0; i < series.length; i++) {
                        let item = series[i];
                        if (item[1] === step) {
                            nearestItem = item;
                            break;
                        }
                        if (item[1] > step) {
                            let index = i - 1;
                            nearestItem = series[index >= 0 ? index : 0];
                            break;
                        }
                        if (!nearestItem) {
                            nearestItem = series[series.length - 1];
                        }
                    }
                }
                return {
                    run: tagList[index].run,
                    item: nearestItem
                };
            });

            if (sortingMethod === 'default' || !sortingMethod) {
                return points;
            }
            let sortedPoints;
            switch (sortingMethod) {
                case 'desc':
                    sortedPoints = sortBy(points, one => one.item[3]);
                    sortedPoints.reverse();
                    break;
                case 'asc':
                    sortedPoints = sortBy(points, one => one.item[3]);
                    break;
                case 'nearest':
                    // Compare other ponts width the trigger point, caculate the nearest sort.
                    sortedPoints = sortBy(points, one => one.item[3] - triggerValue);
                    break;
                default:
                    sortedPoints = points;
            }
            return sortedPoints;
        },

        transformFormatterData(data) {
            let indexPropMap = {
                Time: 0,
                Step: 1,
                Value: 2,
                Smoothed: 3,
                Relative: 4
            };
            let widthPropMap = {
                Run: 40,
                Time: 90,
                Step: 40,
                Value: 50,
                Smoothed: 50,
                Relative: 40
            };
            let transformedData = data.map(item => {
                let data = item.item;
                return {
                    Run: item.run,
                    // Keep six number for easy-read.
                    Smoothed: data[indexPropMap.Smoothed].toString().slice(0, 6),
                    Value: data[indexPropMap.Value].toString().slice(0, 6),
                    Step: data[indexPropMap.Step],
                    Time: moment(Math.floor(data[indexPropMap.Time] * 1000), 'x').format('YYYY-MM-DD HH:mm:ss'),
                    // Relative display value should take easy-read into consideration.
                    // Better to tranform data to 'day:hour', 'hour:minutes', 'minute: seconds' and second only.
                    Relative: Math.floor(data[indexPropMap.Relative] * 60 * 60) + 's'
                };
            });

            let headerHtml = '<tr style="font-size:14px;">';
            headerHtml += Object.keys(transformedData[0]).map(key => {
                return '<td style="padding: 0 4px; font-family: \'Merriweather Sans\'; font-weight: bold; width:' + widthPropMap[key] + 'px;">' + key + '</td>';
            }).join('');
            headerHtml += '</tr>';

            let content = transformedData.map(item => {
                let str = '<tr style="font-size:12px;">';
                str += Object.keys(item).map(val => {
                    return '<td style="padding: 0 4px">' + item[val] + '</td>';
                }).join('');
                str += '</tr>';
                return str;
            }).join('');

            return '<table style="text-align: left;table-layout: fixed;width: 480px;"><thead>' + headerHtml + '</thead>'
                + '<tbody>' + content + '</tbody><table>';
        }
    }
};
</script>
<style lang="stylus">
    .visual-dl-page-charts
        float left
        margin 20px 30px 10px 0
        background: #fff;
        padding: 10px;
        .visual-dl-chart-actions
            vertical-align: middle
            .chart-expand
                float left
            .download-selector
                float left
                width 100px
                margin-top -10px
            .download-button
                float left
</style>

