<template>
    <div class="visual-dl-graph-charts">
        <svg class="visual-dl-page-left">
            <g/>
        </svg>
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

    // for d3 drawing
    import * as d3 from "d3";
    import * as dagre from "dagre";
    import * as dagreD3 from 'dagre-d3';

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
                myCY: null,
                graphUrl: '',
            };
        },
        watch: {
            fitScreen: function(val) {
                this.clearDragedTransform(this.getBigImgEl());
                this.clearDragedTransform(this.getSmallImgDragHandler());
            },
            download: function(val) {
                if (this.myCY) {
                    let aEl = document.createElement('a');
                    aEl.href = this.myCY.png();
                    aEl.download = 'graph.png';
                    aEl.click();
                }
            }
        },
        mounted() {
            this.getOriginChartsData();

            getPluginGraphsGraph().then(({errno, data}) => {
                var raw_data = data.data;
                var data = raw_data;

                // d3 svg drawing
                var g = new dagreD3.graphlib.Graph()
                    .setGraph({})
                    .setDefaultEdgeLabel(function() { return {}; });
                var render = new dagreD3.render();
                var nodeKeys = [];

                var buildInputNodeLabel = function(inputNode) {
                    var nodeLabel = inputNode['data_type'] + ': ' + inputNode['shape'].join('x');
                    return nodeLabel + ' '.repeat(Math.floor(nodeLabel.length/5));
                };

                // add input nodes
                for (var i=0; i<data['input'].length; ++i) {
                    var curInputNode = data['input'][i];
                    var nodeKey = curInputNode['name'];
                    g.setNode(
                        nodeKey,
                        {
                            label: buildInputNodeLabel(curInputNode),
                            class: "input"
                        }
                    );
                    nodeKeys.push(nodeKey);
                }

                // add operator nodes then add edges from inputs to operator and from operator to output
                for (var i=0; i<data['node'].length; ++i) {
                    var curOperatorNode = data['node'][i];
                    var nodeKey = 'opNode_' + i;

                    // add operator node
                    var curOpLabel = curOperatorNode['opType'];
                    g.setNode(
                        nodeKey,
                        {
                            label: curOpLabel + ' '.repeat(Math.floor(curOpLabel.length/5)),
                            class: "operator"
                        }
                    );
                    nodeKeys.push(nodeKey);

                    // add output node
                    var outputNodeKey = curOperatorNode['output'][0];
                    g.setNode(
                        outputNodeKey,
                        {
                            label: outputNodeKey + ' '.repeat(Math.floor(outputNodeKey.length/5)),
                            class: "output"
                        }
                    );
                    nodeKeys.push(outputNodeKey);

                    // add edges from inputs to node and from node to output
                    for (var e=0; e<curOperatorNode['input'].length; ++e) {
                        g.setEdge(curOperatorNode['input'][e], nodeKey);
                    }
                    g.setEdge(nodeKey, curOperatorNode['output'][0]);
                }

                render(d3.select("svg g"), g);
            });
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
                        this.graphUrl = data.url;
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
    .node rect
    .node circle
    .node ellipse
    .node polygon
        stroke: #333
        fill: #fff
        stroke-width: 1.5px

    .edgePath path.path
        stroke: #333
        fill: none
        stroke-width: 1.5px

    .operator
        fill: red

    .output
        fill: green

    .input
        fill: purple

    .visual-dl-graph-charts
        width inherit
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
