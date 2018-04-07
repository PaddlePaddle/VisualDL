<template>
  <v-card
    hover
    class="visual-dl-page-charts">
    <div
      class="visual-dl-chart-box"
      ref="visual_dl_chart_box"/>
    <div class="visual-dl-chart-actions">
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
    </div>
  </v-card>
</template>
<script>
// libs
import echarts from 'echarts';
import {originDataToChartData} from '../histogramHelper';
import {format, precisionRound} from 'd3-format';

// service
import {getPluginHistogramsHistograms} from '../../service';

let zrDrawElement = {};
zrDrawElement.hoverDots = [];
// the time to refresh chart data
const intervalTime = 15;

const p = Math.max(0, precisionRound(0.01, 1.01) - 1);
const yValueFormat = format('.' + p + 'e');

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
    chartType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      originData: [],
      isExpand: false,
    };
  },
  watch: {
    originData: function(val) {
      this.initChartOption();
    },
    chartType: function(val) {
      this.initChartOption();
    },
    running: function(val) {
      val ? this.startInterval() : this.stopInterval();
    },
    isExpand: function(val) {
      this.expandArea(val);
    },
  },
  mounted() {
    let tagInfo = this.tagInfo;
    this.initChart(tagInfo);
    if (this.running) {
      this.startInterval();
    }
  },

  beforeDestroy() {
    this.stopInterval();
  },

  methods: {
    initChart(tagInfo) {
      this.createChart();
      this.getOriginChartData(tagInfo);
    },

    createChart() {
      let el = this.$refs.visual_dl_chart_box;
      this.myChart = echarts.init(el);
    },

    initChartOption() {
      this.myChart.clear();
      let zr = this.myChart.getZr();
      let hoverDots = zrDrawElement.hoverDots;
      if (hoverDots != null && hoverDots.length !== 0) {
        hoverDots.forEach((dot) => zr.remove(dot));
      }
      let chartType = this.chartType;
      let data = this.originData;
      let visData = originDataToChartData(data);
      let tagInfo = this.tagInfo;
      let title = tagInfo.tag.displayName + '(' + tagInfo.run + ')';
      this.setChartOptions(visData, title, chartType);
    },

    setChartOptions(visData, tag, chartType) {
      let grid = {
        left: 45,
        top: 60,
        right: 40,
        bottom: 36,
      };
      let title = {
        text: tag,
        textStyle: {
          fontSize: '12',
          fontWeight: 'normal',
        },
      };
      if (chartType === 'overlay') {
        this.setOverlayChartOption(visData, title, grid);
      } else if (chartType === 'offset') {
        this.setOffsetChartOption(visData, title, grid);
      }
    },

    setOverlayChartOption({chartData, min, max}, title, grid) {
      let seriesOption = chartData.map(({time, step, items}) => ({
        name: 'step' + step,
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        z: 0,
        data: items,
        animationDuration: 100,
        lineStyle: {
          normal: {
            width: 1,
            color: '#008c99',
          },
        },
        encode: {
          x: [2],
          y: [3],
        },
      })
      );
      let option = {
        title: title,
        axisPointer: {
          link: {xAxisIndex: 'all'},
          show: true,
          snap: true,
          triggerTooltip: true,
        },
        grid: grid,
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'value',
          axisLine: {
            onZero: false,
          },
          axisLabel: {
            formatter(value, index) {
              return yValueFormat(value);
            },
          },
          axisPointer: {
            label: {
              formatter({value}) {
                return yValueFormat(value);
              },
            },
          },
        },
        series: seriesOption,
      };

      let zr1 = this.myChart.getZr();
      zr1.on('mousemove', function(e) {
        zr1.remove(zrDrawElement.hoverLine);
        zr1.remove(zrDrawElement.tooltip);
        zr1.remove(zrDrawElement.tooltipX);
        zr1.remove(zrDrawElement.tooltipY);
        zrDrawElement.hoverDots.forEach((dot) => zr1.remove(dot));
        zrDrawElement.hoverDots.length = 0;
      });

      this.myChart.setOption(option, {notMerge: true});
    },

    setOffsetChartOption({chartData, min, max}, title, grid) {
      let rawData = [];
      let minX = min;
      let maxX = max;
      let minZ = Infinity;
      let maxZ = -Infinity;
      let ecChart = this.myChart;
      let maxStep = -Infinity;
      let minStep = Infinity;
      grid.top = 126;
      grid.left = 16;
      grid.right = 40;
      chartData.forEach(function(dataItem) {
        let lineData = [];
        maxStep = Math.max(dataItem.step, maxStep);
        minStep = Math.min(dataItem.step, minStep);
        dataItem.items.forEach(([time, step, x, y]) => {
          minZ = Math.min(minZ, y);
          maxZ = Math.max(maxZ, y);
          lineData.push(x, step, y);
        });
        rawData.push(lineData);
      });

      let option = {
        textStyle: {
          fontFamily: 'Merriweather Sans',
        },
        title,
        color: ['#006069'],
        visualMap: {
          type: 'continuous',
          show: false,
          min: minStep,
          max: maxStep,
          dimension: 1,
          inRange: {
            colorLightness: [0.2, 0.4],
          },
        },
        xAxis: {
          min: minX,
          max: maxX,
          axisLine: {
            onZero: false,
          },
          axisLabel: {
            fontSize: '11',
            formatter: function(value) {
              return Math.round(value * 100) / 100;
            },
          },
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          position: 'right',
          axisLine: {
            onZero: false,
          },
          inverse: true,
          splitLine: {
            show: false,
          },
          axisLabel: {
            fontSize: '11',
          },
        },
        grid,
        series: [{
          type: 'custom',
          dimensions: ['x', 'y'],
          renderItem: function(params, api) {
            let points = makePolyPoints(
              params.dataIndex,
              api.value,
              api.coord,
              params.coordSys.y - 10
            );
            return {
              type: 'polygon',
              silent: true,
              shape: {
                points,
              },
              style: api.style({
                stroke: '#bbb',
                lineWidth: 1,
              }),
            };
          },
          data: rawData,
        }],
      };

      function makePolyPoints(dataIndex, getValue, getCoord, yValueMapHeight) {
        let points = [];
        for (let i = 0; i < rawData[dataIndex].length;) {
          let x = getValue(i++);
          let y = getValue(i++);
          let z = getValue(i++);
          points.push(getPoint(x, y, z, getCoord, yValueMapHeight));
        }
        return points;
      }

      function getPoint(x, y, z, getCoord, yValueMapHeight) {
        let pt = getCoord([x, y]);
        // linear map in z axis
        pt[1] -= (z - minZ) / (maxZ - minZ) * yValueMapHeight;
        return pt;
      }

      let zr = ecChart.getZr();

      function removeTooltip() {
        if (zrDrawElement.hoverLine) {
          zr.remove(zrDrawElement.hoverLine);
          zr.remove(zrDrawElement.tooltip);
          zrDrawElement.hoverDots.forEach((dot) => zr.remove(dot));
          zrDrawElement.hoverDots.length = 0;
          zr.remove(zrDrawElement.tooltipX);
          zr.remove(zrDrawElement.tooltipY);
        }
      }

      zr.on('mouseout', (e) => {
        removeTooltip();
      });

      zr.on('mousemove', (e) => {
        removeTooltip();
        let nearestIndex = findNearestValue(e.offsetX, e.offsetY);
        if (nearestIndex) {
          let getCoord = function(pt) {
            return ecChart.convertToPixel('grid', pt);
          };
          let gridRect = ecChart.getModel().getComponent('grid', 0).coordinateSystem.getRect();

          let linePoints = makePolyPoints(
            nearestIndex.itemIndex,
            function(i) {
              return rawData[nearestIndex.itemIndex][i];
            },
            getCoord,
            gridRect.y - 10
          );

          zr.add(zrDrawElement.hoverLine = new echarts.graphic.Polyline({
            silent: true,
            shape: {
              points: linePoints,
            },
            style: {
              stroke: '#5c5c5c',
              lineWidth: 2,
            },
            z: 999,
          }));

          let itemX;
          rawData.forEach((dataItem) => {
            let binIndex = nearestIndex.binIndex;
            let x = dataItem[binIndex * 3];
            let y = dataItem[binIndex * 3 + 1];
            let z = dataItem[binIndex * 3 + 2];
            let pt = getPoint(x, y, z, getCoord, gridRect.y - 10);
            itemX = pt[0];
            let dot = new echarts.graphic.Circle({
              shape: {
                cx: pt[0],
                cy: pt[1],
                r: 3,
              },
              style: {
                fill: '#000',
                stroke: '#ccc',
                lineWidth: 1,
              },
              z: 1000,
            });
            zr.add(dot);
            zrDrawElement.hoverDots.push(dot);
          });

          let hoveredItem = chartData[nearestIndex.itemIndex];
          zrDrawElement.tooltip = new echarts.graphic.Text({
            position: [e.offsetX + 30, e.offsetY - 50],
            style: {
              fontFamily: 'Merriweather Sans',
              text: yValueFormat(hoveredItem.items[nearestIndex.binIndex][3]),
              textFill: '#000',
              fontSize: 14,
              textBackgroundColor: '#eee',
              textBorderColor: '#008c99',
              textBorderWidth: 2,
              textBorderRadius: 5,
              textPadding: 10,
              rich: {},
            },
            z: 2000,
          });
          zr.add(zrDrawElement.tooltip);

          zrDrawElement.tooltipX = new echarts.graphic.Text({
            position: [
              itemX,
              gridRect.y + gridRect.height,
            ],
            style: {
              fontFamily: 'Merriweather Sans',
              text: Math.round(hoveredItem.items[nearestIndex.binIndex][2] * 1000) / 1000,
              textFill: '#fff',
              textAlign: 'center',
              fontSize: 12,
              textBackgroundColor: '#333',
              textBorderWidth: 2,
              textPadding: [5, 7],
              rich: {},
            },
            z: 2000,
          });
          zr.add(zrDrawElement.tooltipX);

          zrDrawElement.tooltipY = new echarts.graphic.Text({
            position: [
              gridRect.x + gridRect.width,
              linePoints[linePoints.length - 1][1],
            ],
            style: {
              fontFamily: 'Merriweather Sans',
              text: hoveredItem.step,
              textFill: '#fff',
              textVerticalAlign: 'middle',
              fontSize: 12,
              textBackgroundColor: '#333',
              textBorderWidth: 2,
              textPadding: [5, 7],
              rich: {},
            },
            z: 2000,
          });
          zr.add(zrDrawElement.tooltipY);
        }
      });

      function findNearestValue(px, py) {
        let value = ecChart.convertFromPixel('grid', [px, py]);
        let itemIndex;
        let nearestY = Infinity;
        let binIndex;
        chartData.forEach((item, index) => {
          let dist = Math.abs(value[1] - item.step);
          if (dist < nearestY) {
            nearestY = dist;
            itemIndex = index;
          }
        });
        if (itemIndex != null) {
          let dataItem = chartData[itemIndex];
          let nearestX = Infinity;
          dataItem.items.forEach((item, index) => {
            let dist = Math.abs(item[2] - value[0]);
            if (dist < nearestX) {
              nearestX = dist;
              binIndex = index;
            }
          });
          if (binIndex != null) {
            return {
              itemIndex: itemIndex,
              binIndex: binIndex,
            };
          }
        }
      }
      ecChart.setOption(option, {notMerge: true});
    },

    // get origin data per 60 seconds
    startInterval() {
      this.getOringDataInterval = setInterval(() => {
        let tagInfo = this.tagInfo;
        this.getOriginChartData(tagInfo);
      }, intervalTime * 1000);
    },

    stopInterval() {
      clearInterval(this.getOringDataInterval);
    },

    getOriginChartData(tagInfo) {
      let run = tagInfo.run;
      let tag = tagInfo.tag;
      let params = {
        run,
        tag: tag.displayName,
      };
      getPluginHistogramsHistograms(params).then(({status, data}) => {
        if (status === 0) {
          this.originData = data;
        }
      });
    },

    expandArea(expand) {
      let pageBoxWidth = document.getElementsByClassName('visual-dl-chart-page')[0].offsetWidth;
      let width = pageBoxWidth * 0.96; // 4% margin
      if (expand) {
        let el = this.$refs.visual_dl_chart_box;
        el.style.width = width + 'px';
        el.style.height = '600px';
        this.isExpand = true;
        this.myChart.resize({
          width: width,
          height: 600,
        });
      } else {
        let el = this.$refs.visual_dl_chart_box;
        el.style.width = '400px';
        el.style.height = '300px';
        this.isExpand = false;
        this.myChart.resize({
          width: 400,
          height: 300,
        });
      }
    },
  },
};
</script>
<style lang="stylus">
    .visual-dl-page-charts
        float left
        margin 2% 2% 0 0
        background #fff
        padding 10px
        position relative
        .visual-dl-chart-box
            width 400px
            height 300px
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

