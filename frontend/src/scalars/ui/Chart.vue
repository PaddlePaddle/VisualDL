<template>
  <v-card
    hover
    class="visual-dl-page-charts">
    <div
      ref="chartBox"
      class="visual-dl-chart-box"
      :style="computedStyle"/>
    <div class="visual-dl-chart-actions">
      <v-btn
        color="toolbox_icon"
        flat
        icon
        @click="isSelectZoomEnable = !isSelectZoomEnable"
        class="chart-toolbox-icons">
        <img
          v-if="!isSelectZoomEnable"
          src="../../assets/ic_zoom_select_off.svg">
        <img
          v-if="isSelectZoomEnable"
          src="../../assets/ic_zoom_select_on.svg">
      </v-btn>
      <v-btn
        color="toolbox_icon"
        flat
        icon
        @click="restoreChart"
        class="chart-toolbox-icons">
        <img src="../../assets/ic_undo.svg">
      </v-btn>
      <v-btn
        color="toolbox_icon"
        flat
        icon
        @click="isExpand = !isExpand"
        class="chart-toolbox-icons" >
        <img
          v-if="!isExpand"
          src="../../assets/ic_fullscreen_off.svg">
        <img
          v-if="isExpand"
          src="../../assets/ic_fullscreen_on.svg">
      </v-btn>
      <v-btn
        color="toolbox_icon"
        flat
        icon
        @click="saveChartAsImage"
        class="chart-toolbox-icons" >
        <img src="../../assets/ic_download.svg">
      </v-btn>
      <v-menu v-if="tagInfo.tagList.length > 0">
        <v-btn
          color="toolbox_icon"
          slot="activator"
          flat
          icon
          class="chart-toolbox-icons">
          <v-icon >more_vert</v-icon>
        </v-btn>
        <v-list dense>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>Download data in JSON</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>expand_more</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile
            v-for="subItem in tagInfo.tagList"
            :key="subItem.run"
            @click="handleDownLoad(subItem.run)">
            <v-list-tile-content>
              <v-list-tile-title>&nbsp;&nbsp;&nbsp;{{ subItem.run }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-menu>
    </div>
  </v-card>
</template>
<script>

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
const lineWidth = 1.5;
const minQuantile = 0.05;
const maxQuantile = 0.95;
// the time to refresh chart data
const intervalTime = 15;

export default {
  props: {
    runsItems: {
      type: Array,
      required: true,
    },
    tagInfo: {
      type: Object,
      required: true,
    },
    runs: {
      type: Array,
      required: true,
    },
    running: {
      type: Boolean,
      required: true,
    },
    smoothing: {
      type: Number,
      required: true,
    },
    horizontal: {
      type: String,
      required: true,
    },
    sortingMethod: {
      type: String,
      required: true,
    },
    outlier: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    computedStyle() {
      return 'height:' + this.height + 'px;'
        + 'width:' + this.width + 'px;';
    },
  },
  data() {
    return {
      width: 400,
      height: 300,
      isExpand: false,
      isSelectZoomEnable: true,
      originData: [],
    };
  },
  watch: {
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
    },
    isExpand: function(val) {
      this.expandArea(val);
    },
    isSelectZoomEnable: function(val) {
      this.toggleSelectZoom(val);
    },
  },
  mounted() {
    this.initChart(this.tagInfo);
    this.toggleSelectZoom(true);

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
      let seriesOption = tagList.map((item) => [
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
              width: lineWidth,
            },
          },
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
              width: lineWidth,
            },
          },
        },
      ]
      );
      seriesOption = flatten(seriesOption);
      let legendOptions = tagList.map((item) => item.run);
      let instance = this;
      let option = {
        textStyle: {
          fontFamily: 'Merriweather Sans',
        },
        color: [
          '#008c99',
          '#c23531',
          '#FF9900',
          '#109618',
          '#990099',
          '#3B3EAC',
          '#DD4477',
          '#AAAA11',
          '#5574A6',
          '#8B0707',
        ],
        title: {
          text: tag,
          textStyle: {
            fontSize: 13,
            fontWeight: 'normal',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: true,
          },
          textStyle: {
            fontSize: '13',
          },
          position: ['10%', '90%'],
          formatter(params, ticket, callback) {
            let data = instance.getFormatterPoints(params[0].data);
            return instance.transformFormatterData(data);
          },
        },
        toolbox: {
          show: true,
          showTitle: false,
          itemSize: 0,
          feature: {
            dataZoom: {},
          },
        },
        legend: {
          data: legendOptions,
          top: 39,
        },
        grid: {
          left: 48,
          top: 75,
          right: 40,
          bottom: 36,
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            fontSize: '11',
          },
          splitNumber: this.isExpand ? 10 : 5,
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: '11',
            formatter(value) {
              return value.toString().slice(0, 5);
            },
          },
        },
        series: seriesOption,
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
      let requestList = tagList.map((item) => {
        let params = {
          run: item.run,
          tag: tag,
        };
        return getPluginScalarsScalars(params);
      });
      axios.all(requestList).then((resArray) => {
        if (resArray.every((res) => res.status === 0)) {
          this.originData = resArray.map((res) => res.data);
        }
      });
    },

    setChartData() {
      let seriesData = this.originData.map((lineData) => {
        if (lineData.length == 0) return [];
        // add the smoothed data
        this.transformDataset(lineData);
        return [
          {
            data: lineData,
            encode: {
              // map 1 dimension to xAixs.
              x: [1],
              // map 2 dimension to yAixs.
              y: [2],
            },
          },
          {
            data: lineData,
            encode: {
              // Map 1 dimension to xAixs.
              x: [1],
              // Map 3 dimension to yAixs,
              // the third number is smoothed value.
              y: [3],
            },
          },
        ];
      });
      this.myChart.setOption({
        series: flatten(seriesData),
      });
    },

    getChartOptions() {
      return this.myChart.getOption() || {};
    },
    handleDownLoad(runItemForDownload) {
      let options = this.getChartOptions();
      let series = options.series || [];
      let seriesItem = series.find((item) => item.name === runItemForDownload) || {};
      let fileName = this.tagInfo.tag.replace(/\//g, '-');
      generateJsonAndDownload(seriesItem.data, fileName);
    },

    transformDataset(seriesData) {
      // smooth
      this.transformData(seriesData, this.smoothing);
    },

    /**
     * @desc 1、add smooth data depend on smoothingWeight. see https://en.wikipedia.org/wiki/Moving_average for detail
     *       2、add relative data
     * @param {Object} seriesData: echarts series Object
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
    setChartsOutlier() {
      let domainRangeArray = this.originData.map((seriesData) => this.computeDataRange(seriesData, this.outlier));

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
      if (arr.length == 0) return [];
      let max;
      let min;
      if (!isQuantile) {
        // Get the orgin data range.
        max = maxBy(arr, (item) => item[2])[2];
        min = minBy(arr, (item) => item[2])[2];
      } else {
        // Get the quantile range.
        let sorted = sortBy(arr, [(item) => item[2]]);
        min = quantile(sorted, minQuantile, (item) => item[2]);
        max = quantile(arr, maxQuantile, (item) => item[2]);
      }
      return [min, max];
    },

    paddedYDomain(min, max) {
      return {
        max: max > 0 ? max * 1.1 : max * 0.9,
        min: min > 0 ? min * 0.9 : min * 1.1,
      };
    },

    setChartOutlierOptions({min, max}) {
      this.myChart.setOption({
        yAxis: {
          min,
          max,
        },
      });
    },

    // Chart horizontal options methods and functions ---- start.
    setChartHorizon() {
      let seriesOption = this.myChart.getOption().series;
      let encodeSeries = (val) => {
        return {
          encode: {
            x: [val],
          },
        };
      };
      let stepSeries = seriesOption.map((item) => encodeSeries(1));
      let relativeSeries = seriesOption.map((item) => encodeSeries(4));
      let wallSeries = seriesOption.map((item) => encodeSeries(0));
      let horizontalToxAxisOptions = {
        step: {
          xAxis: {
            type: 'value',
            axisLabel: {
              fontSize: '11',
            },
            splitNumber: this.isExpand ? 10 : 5,
          },
          series: stepSeries,
        },
        relative: {
          xAxis: {
            type: 'value',
            axisLabel: {
              fontSize: '11',
            },
            splitNumber: this.isExpand ? 10 : 5,
          },
          series: relativeSeries,
        },
        wall: {
          xAxis: {
            type: 'time',
            axisLabel: {
              fontSize: '11',
              formatter: function(value, index) {
                // The value is in seconds, need to convert to milliseconds
                let date = new Date(value * 1000);
                return date.toLocaleTimeString();
              },
            },
          },
          series: wallSeries,
        },
      };
      this.myChart.setOption(horizontalToxAxisOptions[this.horizontal]);
    },

    expandArea(expand) {
      let pageBoxWidth = document.getElementsByClassName('visual-dl-chart-page-box')[0].offsetWidth;
      let width = pageBoxWidth * 0.96; // 4% margin
      if (expand) {
        let el = this.$refs.chartBox;
        el.style.width = width + 'px';
        el.style.height = '600px';
        this.myChart.resize({
          width: width,
          height: 600,
        });
      } else {
        let el = this.$refs.chartBox;
        el.style.width = '400px';
        el.style.height = '300px';
        this.myChart.resize({
          width: 400,
          height: 300,
        });
      }

      this.myChart.setOption({
        xAxis: {
          splitNumber: this.isExpand ? 10 : 5,
        },
      });
    },

    toggleSelectZoom(enable) {
      let instance = this;
      setTimeout(function() {
        instance.myChart.dispatchAction({
          type: 'takeGlobalCursor',
          key: 'dataZoomSelect',
          dataZoomSelectActive: enable,
        });
      }, 0);
    },

    restoreChart() {
      this.myChart.dispatchAction({
        type: 'restore',
      });
    },

    saveChartAsImage() {
      let dataUrl = this.myChart.getDataURL({
        pixelRatio: 1,
        backgroundColor: '#fff',
      });
      let fileName = this.tagInfo.tag.replace(/\//g, '-');
      let link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        } else {
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
          item: nearestItem,
        };
      });

      if (sortingMethod === 'default' || !sortingMethod) {
        return points;
      }
      let sortedPoints;
      switch (sortingMethod) {
      case 'descending':
        sortedPoints = sortBy(points, (one) => one.item[3]);
        sortedPoints.reverse();
        break;
      case 'ascending':
        sortedPoints = sortBy(points, (one) => one.item[3]);
        break;
      case 'nearest':
        // Compare other ponts width the trigger point, caculate the nearest sort.
        sortedPoints = sortBy(points, (one) => one.item[3] - triggerValue);
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
        Relative: 4,
      };
      let widthPropMap = {
        Run: 40,
        Time: 120,
        Step: 40,
        Value: 50,
        Smoothed: 60,
        Relative: 60,
      };
      let transformedData = data.map((item) => {
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
          Relative: Math.floor(data[indexPropMap.Relative] * 60 * 60) + 's',
        };
      });

      let headerHtml = '<tr style="font-size:14px;">';
      headerHtml += Object.keys(transformedData[0]).map((key) => {
        return '<td style="padding: 0 4px; font-family: \'Merriweather Sans\'; font-weight: bold; width:' +
          widthPropMap[key] + 'px;">' + key + '</td>';
      }).join('');
      headerHtml += '</tr>';

      let content = transformedData.map((item) => {
        let str = '<tr style="font-size:12px;">';
        str += Object.keys(item).map((val) => {
          return '<td style="padding: 0 4px">' + item[val] + '</td>';
        }).join('');
        str += '</tr>';
        return str;
      }).join('');

      return '<table style="text-align: left;table-layout: fixed;width: 480px;"><thead>' + headerHtml + '</thead>'
        + '<tbody>' + content + '</tbody><table>';
    },
  },
};
</script>
<style lang="stylus">
    .visual-dl-page-charts
        float left
        margin 2% 2% 0 0
        padding 10px
        position relative
        .visual-dl-chart-actions
            opacity 0
            transition: opacity .3s ease-out;
            position absolute
            top 4px
            right 10px
            img
                width 30px
                height 30px
                position absolute
                top 0
                bottom 0
                margin auto
            .chart-toolbox-icons
                width 25px
                height 25px
                margin-left -4px
                margin-right -4px

    .visual-dl-page-charts:hover
        .visual-dl-chart-actions
            opacity 1

</style>

