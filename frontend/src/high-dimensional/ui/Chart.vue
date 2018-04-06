<template>
  <v-card
    hover
    class="visual-dl-page-charts">
    <div
      ref="chartBox"
      class="visual-dl-chart-box"
      :style="computedStyle"/>
  </v-card>
</template>

<script>
import echarts from 'echarts';
import 'echarts-gl';

export default {
    props: ['config', 'displayWordLabel', 'searchText', 'embedding_data', 'dimension'],
    data() {
        return {
            width: 900,
            height: 600,
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
        this.myChart.showLoading();

        this.set2DChartOptions();
        this.setDisplayWordLabel();
    },
    watch: {
        embedding_data: function(val) {
            this.myChart.hideLoading();
            this.myChart.setOption({
                series: [{
                    // Grab the 'matched' series data
                    name: 'all',
                    data: val,
                }],
            });
        },
        displayWordLabel: function(val) {
            this.setDisplayWordLabel();
        },
        dimension: function(val) {
            this.myChart.clear();
            this.myChart.showLoading();
            if (val === '2') {
                this.set2DChartOptions();
                this.setDisplayWordLabel();
            } else {
                this.set3DChartOptions();
                this.setDisplayWordLabel();
            }
        },
        searchText: function(val) {
            // Filter the data that has the hasPrefix
            let matched_words = [];
            if (val != '') {
                val = val.toLowerCase();

                function hasPrefix(value) {
                    let word = value[value.length - 1];
                    return (typeof word == 'string' && word.toLowerCase().startsWith(val));
                }

                matched_words = this.embedding_data.filter(hasPrefix);
            }

            // Update the matched series data
            this.myChart.setOption({
                series: [{
                    // Grab the 'matched' series data
                    name: 'matched',
                    data: matched_words,
                }],
            });
        },
    },
    methods: {
        createChart() {
            // Initialize the eChartBox
            let el = this.$refs.chartBox;
            this.myChart = echarts.init(el);
        },
        set2DChartOptions() {
            let typeD = 'normal';
            let option = {
                xAxis: {},
                yAxis: {},
                series: [{
                        name: 'all',
                        symbolSize: 10,
                        data: this.embedding_data,
                        type: 'scatter',
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
          let symbolSize = 2.5;
          let option3d = {
            grid3D: {},
                    xAxis3D: {
                        type: 'category',
                    },
                    yAxis3D: {},
                    xAxis3D: {},
                    zAxis3D: {},
                    dataset: {
                        source: this.embedding_data,
                    },
                    series: [
                        {
                            name: 'all',
                            type: 'scatter3D',
                            symbolSize: symbolSize,
                            data: [],
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
                        },
                        emphasis: {
                            show: true,
                        },
                    },
                }],
            });
        },
    },
};

</script>

<style lang="stylus">
    .visual-dl-page-charts
        float left
        padding 10px
        position relative
</style>
