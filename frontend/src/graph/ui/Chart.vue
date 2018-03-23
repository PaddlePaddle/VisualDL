<template>
    <div class="visual-dl-graph-charts">
        <div id="container" class="cy draggable" ref="draggable"></div>
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
    import cytoscape from 'cytoscape';
    import dagre from 'cytoscape-dagre';

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
                if (this.myCY) {
                    let aEl = document.createElement('a');
                    aEl.href = this.myCY.png();
                    aEl.download = 'graph.png';
                    aEl.click();
                }
            }
        },
        mounted() {
            var that = this;
            this.getOriginChartsData();
            cytoscape.use( dagre );
            getPluginGraphsGraph().then(({errno, data}) => {

                var real_data = data.data;
                var data = real_data;
                console.log('real_data:');
                console.log(real_data);
                var graph_data = {
                    nodes: [],
                    edges: []
                };

                var node_names = [];
                for (var i = 0; i < data.input.length; ++i) {
                    graph_data.nodes.push({
                        data: {id: data.input[i].name}
                    });
                    node_names.push(data.input[i].name);
                }

                for (var i = 0; i < data.edges.length; ++i) {
                    var source = data.edges[i].source;
                    var target = data.edges[i].target;
//                    console.log('data '+i);
//                    console.log(data.edges[i]);
                    if (node_names.includes(source) === false) {
                        console.log('source');
                        console.log(source);
                        graph_data.nodes.push({
                            data: {id: source, node_data:source}
                        });
                        node_names.push(source);
                    }

                    if (node_names.includes(target) === false) {
                        console.log('\ntarget');
                        console.log(target);
                        var node_data = target;
                        if (target.includes('node_')) {
                            // it is a operator node
                            var node_id = target.substring(5);
//                            node_data = data.node
                            console.log('>>>');
                            console.log(data.node[node_id].opType);
                            node_data = data.node[node_id].opType;
                        }
                        graph_data.nodes.push({
                            data: {id: target, node_data:node_data}
                        });
                        node_names.push(target);
                    }
                    graph_data.edges.push({
                        data: {source: source, target: target}
                    });
                }
                console.log(graph_data);
                // >> cy
                var cy = cytoscape({
                    container: document.getElementById('container'),

                    boxSelectionEnabled: false,
                    autounselectify: true,

                    layout: {
                        name: 'dagre'
                    },

                    style: [
                        {
                            selector: 'node',
                            style: {
                                'width': 20,
                                'height': 20,
                                'content': 'data(node_data)',
                                'text-opacity': 0.5,
                                'text-valign': 'center',
                                'text-halign': 'right',
                                'background-color': '#11479e'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'curve-style': 'bezier',
                                'width': 2,
                                'target-arrow-shape': 'triangle',
                                'line-color': '#9dbaea',
                                'target-arrow-color': '#9dbaea'
                            }
                        }
                    ],
                    elements: graph_data,
                });
                this.myCY = cy;

                cy.nodes().forEach(function(node){
                    if (node.id().includes('node_')) {
                        node.style('width', '40px');
                        node.style('height', '40px');
                        node.style('shape', 'rectangle');
                        node.style('background-color', 'green');
                    }

                    let collapsed = true;
                    node.on('tap', function(evt){
                        if (node.id().includes('node_')) {
                            collapsed = !collapsed;
                            if (!collapsed) {
                                node.style('width', '60px');
                                node.style('height', '60px');
                                node.style('background-color', '#008c99');
                            } else {
                                node.style('width', '40');
                                node.style('height', '40px');
                                node.style('background-color', 'green');
                            }
                        }
                    });
                });
                // << cy

//                cy.$('#node_0').on('tap', function(evt){
//                    this.hide();
//                });
//
//                cy.$('#node_4').on('tap', function(evt){
//                    that.$router.push('/scalars');
//                });

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
    .cy
        height: 100%
        width: 70%
        position: absolute
        top: 0px
        left: 0px


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
