<template>
    <div>
        <div ref="chartBox" class="visual-dl-chart-box" :style="computedStyle">
        </div>
    </div>
</template>

<script>
import echarts from 'echarts';

export default {
    props: ['config', 'displayWordLabel', 'searchText'],
    data() {
        return {
            width: 900,
            height: 600,
            embedding_data: [
                        [10.0, 8.04, "yellow"],
                        [8.0, 6.95, "blue"],
                        [13.0, 7.58, "red"],
                        [9.0, 8.81, "king"],
                        [11.0, 8.33, "queen"],
                        [14.0, 9.96, "man"],
                        [6.0, 7.24, "women"],
                        [4.0, 4.26, "kid"],
                        [12.0, 10.84, "adult"],
                        [7.0, 4.82, "light"],
                        [5.0, 5.68, "dark"]
                    ]
        };
    },
    computed: {
        computedStyle() {
            return 'height:' + this.height + 'px;'
                + 'width:' + this.width + 'px;';
        }
    },
    created() {

    },
    mounted() {
        this.createChart();
        this.setChartsOptions();
    },
    watch: {
        displayWordLabel: function(val) {
            this.setDisplayWordLabel()
        },
        searchText: function(val) {
            var matched_words = []
            if (val != '') {
                val = val.toLowerCase()

                function hasPrefix(value) {
                    var word = value[2]
                    return (typeof word == "string" && word.toLowerCase().startsWith(val))
                }

                matched_words = this.embedding_data.filter(hasPrefix);
            }

            // Update the matched series data
            this.myChart.setOption({
                series: [{
                    // Grab the 'matched' series data
                    name: 'matched',
                    data: matched_words
                }]
            });
        },
    },
    methods: {
        createChart() {
            // Initialize the eChartBox
            let el = this.$refs.chartBox;
            this.myChart = echarts.init(el);
        },
        setChartsOptions(){
            var typeD = "normal";
            var option = {
                xAxis: {},
                yAxis: {},
                series: [{
                    symbolSize: 10,
                    data: this.embedding_data,
                    type: 'scatter',
                },
                {
                  name: "matched",
                  animation: false,
                  symbolSize:10,
                  data: [],
                  itemStyle: {
                    normal: {
                        opacity: 1
                    }
                  },
                  label: {
                            normal: {
                                show: true,
                                formatter: function (param) {
                                    return param.data[2];
                                },
                                position: 'top'
                            }
                        },
                  type: 'scatter'
                }
                ]
            };
            this.myChart.setOption(option);
        },
        setDisplayWordLabel() {
                this.myChart.setOption({
                    label: {
                            normal: {
                                show: this.displayWordLabel,
                                formatter: function (param) {
                                    return param.data[2];
                                },
                                position: 'top'
                            },
                            emphasis: {
                            show: true,
                            }
                        }
                })
        },

    }
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
