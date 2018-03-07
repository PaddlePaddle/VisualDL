<template>
    <div class="visual-dl-graph-charts">
        <div v-if="graphUrl" class="visual-dl-img-box">
            <div class="small-img-box">
                <img class="small-img" ref="small_img" width="30" :src="graphUrl" />
                <div class="screen-handler" ref="screen_handler"></div>
            </div>
            <img class="draggable"
                 ref="draggable"
                 :width="computedWidth"
                 :src="graphUrl" />
        </div>
    </div>
</template>
<script>
// libs
import echarts from 'echarts';
import {
    dragMovelHandler,
    tansformElement,
    relativeMove
} from './dragHelper';
// service
import {getPluginGraphsGraph} from '../../service';

// https://github.com/taye/interact.js
import interact from 'interactjs';

export default {
    props: ['fitScreen', 'download', 'scale'],
    computed: {
        computedWidth() {
            let scale = this.scale;
            return Math.floor(scale * 2 * 700);
        }
    },
    data() {
        return {
            width: 800,
            height: 600,
            graphUrl: '',
        };
    },
    watch: {
        fitScreen: function(val) {
            this.clearDragedTransform(this.getBigImgEl());
            this.clearDragedTransform(this.getSmallImgDragHandler());
        },
        download: function(val) {
            let aEl = document.createElement('a');
            aEl.href = this.graphUrl;
            aEl.download = 'graph.png';
            aEl.click();
        }
    },
    mounted() {
        this.getOriginChartsData();
    },

    methods: {
        createChart() {
            let el = this.el.getElementsByClassName('visual-dl-chart-box')[0];
            this.myChart = echarts.init(el);
        },

        initChartOption(data) {
            this.setChartOptions(data);
        },
        setChartOptions(data) {
            this.myChart.setOption(data);
        },

        getOriginChartsData() {
            getPluginGraphsGraph().then(({status, data}) => {
                if (status === 0 && data.url) {
                    this.graphUrl = data.url
                    this.addDragEventForImg();
                }
            });
        },

        clearDragedTransform(dragImgEl) {
            dragImgEl.style.transform = 'none';
            dragImgEl.setAttribute('data-x', 0);
            dragImgEl.setAttribute('data-y', 0);
        },

        getBigImgEl() {
            return this.$refs.draggable
        },

        getSmallImgEl() {
            return this.$refs.small_img
        },

        getSmallImgDragHandler() {
            return this.$refs.screen_handler
        },

        addDragEventForImg() {
            let that = this;
            // target elements with the "draggable" class
            interact('.draggable').draggable({
                // enable inertial throwing
                inertia: true,
                autoScroll: true,
                // call this function on every dragmove event
                onmove(event) {
                    dragMovelHandler(event, (target, x, y) => {
                        tansformElement(target, x, y);
                        // compute the proportional value
                        let triggerEl = that.getBigImgEl();
                        let relativeEl = that.getSmallImgDragHandler();

                        relativeMove({triggerEl, x, y}, relativeEl);
                    });
                }
            });

            interact('.screen-handler').draggable({
                // enable inertial throwing
                inertia: true,
                autoScroll: true,
                restrict: {
                    restriction: 'parent',
                    endOnly: false,
                    elementRect: {
                        top: 0,
                        left: 0,
                        bottom: 1,
                        right: 1
                    }
                },
                // call this function on every dragmove event
                onmove(event) {
                    dragMovelHandler(event, (target, x, y) => {
                        tansformElement(target, x, y);
                        // compute the proportional value
                        let triggerEl = that.getSmallImgEl();
                        let relativeEl = that.getBigImgEl();

                        relativeMove({triggerEl, x, y}, relativeEl);
                    });
                }
            });
        }
    }
};
</script>
<style lang="stylus">
    .visual-dl-graph-charts
        width 90%
        margin 0 auto
        margin-bottom 20px

        .visual-dl-chart-box
            height 600px

        .visual-dl-img-box
            border solid 1px #e4e4e4
            position relative
            background #f0f0f0
            overflow hidden

            img
                box-sizing border-box
                margin 0 auto
                display block

            .small-img-box
                width 30px
                box-sizing border-box
                position absolute
                right 0
                top 0
                border-left solid 1px #e4e4e4
                border-bottom solid 1px #e4e4e4
                background #f0f0f0
                z-index 1

                .screen-handler
                    box-sizing border-box
                    position absolute
                    width 30px
                    height 20px
                    border solid 1px #666
                    top 0
                    left -1px
</style>
