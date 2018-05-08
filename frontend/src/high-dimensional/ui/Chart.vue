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
        @click="saveChartAsImage"
        class="chart-toolbox-icons" >
        <img src="../../assets/ic_download.svg">
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import echarts from 'echarts';
import 'echarts-gl';

export default {
  props: {
    embeddingData: {
      type: Array,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    displayWordLabel: {
      type: Boolean,
      required: true,
    },
    searchText: {
      type: String,
      required: true,
    },
    dimension: {
      type: String,
      required: true,
    },
    showLoading: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      width: 900,
      height: 600,
      regularLabelColor: '#008c99',
      matchedLabelColor: '#c23531',
      isSelectZoomEnable: true,

    };
  },
  computed: {
    computedStyle() {
      return 'height:' + this.height + 'px;' +
        'width:' + this.width + 'px;';
    },
  },
  created() {},
  mounted() {
    this.createChart();
    this.set2DChartOptions();
    this.setDisplayWordLabel();
    this.toggleSelectZoom(true);
  },
  watch: {
    embeddingData: function(val) {
      // Got new data, pass to the filter function to render the 'matched' set and 'not matched' set
      this.filterSeriesDataAndSetOption(this.searchText);
    },
    displayWordLabel: function(val) {
      this.setDisplayWordLabel();
    },
    dimension: function(val) {
      this.myChart.clear();
      if (val === '2') {
        this.set2DChartOptions();
        this.setDisplayWordLabel();
      } else {
        this.set3DChartOptions();
        this.setDisplayWordLabel();
      }
    },
    searchText: function(val) {
      this.filterSeriesDataAndSetOption(val);
    },
    showLoading: function(val) {
      if (val) {
        this.myChart.showLoading();
      } else {
        this.myChart.hideLoading();
      }
    },
    isSelectZoomEnable: function(val) {
      this.toggleSelectZoom(val);
    },
  },
  methods: {
    createChart() {
      // Initialize the eChartBox
      let el = this.$refs.chartBox;
      this.myChart = echarts.init(el);
    },
    set2DChartOptions() {
      let option = {
        animation: false,
        xAxis: {},
        yAxis: {},
        toolbox: {
          show: true,
          showTitle: false,
          itemSize: 0,

          feature: {
            dataZoom: {
            },
            restore: {},
            saveAsImage: {},
          },
        },
        series: [{
                   name: 'all',
                   symbolSize: 10,
                   data: [],
                   type: 'scatter',
                   color: this.regularLabelColor,
                 },
                 {
                   name: 'matched',
                   animation: false,
                   symbolSize: 10,
                   data: [],
                   itemStyle: {
                     normal: {
                       opacity: 1,
                     },
                   },
                   label: {
                     normal: {
                       show: true,
                       formatter: function(param) {
                         return param.data[param.data.length - 1];
                       },
                       position: 'top',
                     },
                   },
                   type: 'scatter',
                 },
        ],
      };
      this.myChart.setOption(option);
    },
    set3DChartOptions() {
      let symbolSize = 8;
      let option3d = {
        animation: false,
        grid3D: {},
        xAxis3D: {
          type: 'category',
        },
        yAxis3D: {},
        xAxis3D: {},
        zAxis3D: {},
        dataset: {
          source: this.embeddingData,
        },
        series: [
          {
            name: 'all',
            type: 'scatter3D',
            symbolSize: symbolSize,
            data: [],
            color: this.regularLabelColor,
          },
          {
            name: 'matched',
            animation: false,
            symbolSize: symbolSize,
            data: [],
            label: {
              normal: {
                show: true,
                formatter: function(param) {
                  return param.data[param.data.length - 1];
                },
                position: 'top',
                textStyle: {
                  color: this.matchedLabelColor,
                },
              },
            },
            type: 'scatter3D',
          },
        ],
      };
      this.myChart.setOption(option3d);
    },
    setDisplayWordLabel() {
      this.myChart.setOption({
        series: [{
          // Grab the 'all' series data
          name: 'all',
          label: {
            normal: {
              show: this.displayWordLabel,
              formatter: function(param) {
                return param.data[param.data.length - 1];
              },
              position: 'top',
              textStyle: {
                color: this.regularLabelColor,
              },
            },
            emphasis: {
              show: true,
            },
          },
        }],
      });
    },
    filterSeriesDataAndSetOption(keyWord) {
      // Filter the data that has the hasPrefix
      let matchedWords = [];
      let notMatchedWords = [];

      if (keyWord != '') {
        keyWord = keyWord.toLowerCase();
        this.embeddingData.forEach( function(dataItem) {
          let word = dataItem[dataItem.length - 1];

          if (typeof word == 'string' && word.toLowerCase().startsWith(keyWord)) {
            matchedWords.push(dataItem);
          } else {
            notMatchedWords.push(dataItem);
          }
        });
      } else {
        notMatchedWords = this.embeddingData;
      }

      // Update the matched series data
      this.myChart.setOption({
        series: [{
                   // Grab the 'matched' series data
                   name: 'matched',
                   data: matchedWords,
                 },
                 {
                   // Grab the 'all' series data
                   name: 'all',
                   data: notMatchedWords,
        }],
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
      let fileName = 'embedding';
      let link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};

</script>

<style lang="stylus">
    .visual-dl-page-charts
        float left
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
