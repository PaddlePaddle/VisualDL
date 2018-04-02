<template>
    <v-card hover class="visual-dl-page-charts">
        <div ref="chartBox" class="visual-dl-chart-box" :style="computedStyle">
        </div>
    </v-card>
</template>

<script>
import echarts from 'echarts';

export default {
    props: ['config', 'displayWordLabel', 'searchText', 'embedding_data'],
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
        }
    },
    created() {},
    mounted() {
        this.createChart();
        this.myChart.showLoading()
        this.setChartsOptions();
        this.setDisplayWordLabel();
    },
    watch: {
        embedding_data: function(val) {
            this.myChart.hideLoading();
            this.myChart.setOption({
                series: [{
                    // Grab the 'matched' series data
                    name: 'all',
                    data: val
                }]
            });
        },
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
        setChartsOptions() {
            var typeD = "normal";
            var option = {
                xAxis: {},
                yAxis: {},
                series: [{
                        name: "all",
                        symbolSize: 10,
                        data: this.embedding_data,
                        type: 'scatter',
                    },
                    {
                        name: "matched",
                        animation: false,
                        symbolSize: 10,
                        data: [],
                        itemStyle: {
                            normal: {
                                opacity: 1
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                formatter: function(param) {
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
                series: [{
                    // Grab the 'all' series data
                    name: 'all',
                    label: {
                        normal: {
                            show: this.displayWordLabel,
                            formatter: function(param) {
                                return param.data[2];
                            },
                            position: 'top'
                        },
                        emphasis: {
                            show: true,
                        }
                    }
                }]
            });
        },
    }
};

</script>

<style lang="stylus">
    .visual-dl-page-charts
        float left
        padding 10px
        position relative
</style>
