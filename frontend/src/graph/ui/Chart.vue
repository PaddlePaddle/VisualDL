<template>
  <div class="visual-dl-graph-charts">
    <svg
      :style="{ width: imageWidth + 'px', height: imageHeight + 'px' }"
      class="visual-dl-page-left"
      ref="graphSvg">
      <g/>
    </svg>
  </div>
</template>
<script>
// service
import {getPluginGraphsGraph} from '../../service';

// Loading the JS lib file will bind saveSvgAsPng to window,
// which does an SVG -> PNG -> download process.
import './svgToPngDownloadHelper.js';

// for d3 drawing
import * as d3 from 'd3';

import has from 'lodash/has';
import isArrayLike from 'lodash/isArrayLike';

export default {
  props: {
    'doDownload': {
      type: Boolean,
      required: true,
    },
    'doRestore': {
      type: Boolean,
      required: true,
    },
    'scale': {
      type: Number,
      required: true,
    },
  },
  computed: {},
  data() {
    return {
      imageHeight: 0,
      imageWidth: 0,
      originImageWidth: 0,
      originImageHeight: 0,
      graphZoom: null,
      svgSelection: null,
      zoomScale: null,
      graphConfig: {
        drawInputNode: false,
        drawOutputNode: false,
        drawTempNode: false,
        inputMap: {},
      },
    };
  },
  watch: {
    doDownload: function(val) {
      let chartScope = this;
      if (this.doDownload) {
        // in order to download the full graph image, we need to first restore it
        // to its original size
        this.restoreImage(true);
        chartScope.$emit('triggerDownload', false);
      }
    },
    doRestore: function(val) {
      this.restoreImage(false);
    },
    scale: function(val) {
      let k = this.zoomScale(val);
      let svg = d3.select('svg');
      svg.call(this.graphZoom.transform, d3.zoomIdentity.scale(k));
    },
  },
  methods: {
    // get the relate operator of a variable
    getVarRelateDict(graphData) {
      let dic = {};
      for (let i = 0; i < graphData['node'].length; ++i) {
        let curOperatorNode = graphData['node'][i];
        let nodeKey = 'opNode_' + i;
        // record all relate operator of a variable
        if (has(curOperatorNode, 'output') && isArrayLike(curOperatorNode['output'])) {
          for (let j = 0; j < curOperatorNode['output'].length; ++j) {
            let outputData = curOperatorNode['output'][j];
            if (!dic[outputData]) {
              dic[outputData] = {'input': [], 'output': []};
            }
            let arr = dic[outputData]['input'];
            arr[arr.length] = nodeKey;
          }
        }
        if (has(curOperatorNode, 'input') && isArrayLike(curOperatorNode['input'])) {
          for (let j = 0; j < curOperatorNode['input'].length; ++j) {
            let inputData = curOperatorNode['input'][j];
            if (!dic[inputData]) {
              dic[inputData] = {'input': [], 'output': []};
            }
            let arr = dic[inputData]['output'];
            arr[arr.length] = nodeKey;
          }
        }
      }
      return dic;
    },
    getInputNodeStyle() {
      return 'opacity: 0.1; ' +
        'stroke-width: 3px; ' +
        'stroke: #333; ' +
        'stroke-color: #41b3a3; ' +
        'fill: #6c648b; ';
    },
    getOutputNodeStyle() {
      return 'opacity: 0.1;' +
        'stroke-width: 3px; ' +
        'stroke-dasharray: 5, 5;' +
        'stroke: #333；' +
        'stroke-color: #41b3a3; ' +
        'fill: #015249; ';
    },
    getTempNodeStyle() {
      return getOutputNodeStyle();
    },
    getOpNodeStyle() {
      return 'stroke-width: 3px; ' +
        'opacity: 0.1; ' +
        'rx: 10; ' +
        'ry: 10; ' +
        'stroke: #333; ' +
        'stroke-color: #41b3a3; ' +
        'fill: #008c99; ';
    },
    setGraphNode(graph, nodeKey, labelVal, shapeVal, className, styleVal) {
      graph.setNode(
        nodeKey,
        {
          label: labelVal,
          shape: shapeVal,
          class: className,
          style: styleVal,
        }
      );
    },
    buildInputNodeLabel(inputNode) {
      // TODO(daming-lu): need more complex compound node
      let nodeLabel = 'id: ' + inputNode['name'] + '\n'
        + 'type: ' + inputNode['data_type'] + '\n'
        + 'dims: ' + inputNode['shape'].join(' x ');
      return nodeLabel;
    },
    buildGraph(graph, graphData) {
      // add operator node
      for (let i = 0; i < graphData['node'].length; ++i) {
        let curOperatorNode = graphData['node'][i];
        let nodeKey = 'opNode_' + i;

        // add operator node
        let curOpLabel = curOperatorNode['opType'];
        curOpLabel = curOpLabel + ' '.repeat(Math.floor(curOpLabel.length/5));
        this.setGraphNode(graph, nodeKey, curOpLabel, 'rect', 'operator', this.getOpNodeStyle());
      }
      let dic = this.getVarRelateDict(graphData);

      for (let obj in dic) {
        if (!dic.hasOwnProperty(obj)) continue;

        // add input node
        if (dic[obj]['input'].length === 0 && this.graphConfig.drawInputNode === true) {
          let temp = obj.indexOf('@');
          let nodeKey = obj;
          if (temp > 0) {
            nodeKey = obj.substr(0, temp);
          }
          let index = this.graphConfig.inputMap[nodeKey];
          let curInputNode = graphData['input'][index];
          this.setGraphNode(graph, nodeKey,
                            this.buildInputNodeLabel(curInputNode), 'rect', 'input', this.getInputNodeStyle());
          for (let output in dic[obj]['output']) {
            if (!dic[obj]['output'].hasOwnProperty(output)) continue;
            graph.setEdge(nodeKey, dic[obj]['output'][output]);
          }
        }

        // add output node
        if (dic[obj]['output'].length === 0 && this.graphConfig.drawOutputNode === true) {
          let nodeKey = obj;
          let outputPadding = ' '.repeat(Math.floor(nodeKey.length/2));
          this.setGraphNode(graph, nodeKey, nodeKey + outputPadding, 'diamond', 'output', this.getOutputNodeStyle());
          for (let input in dic[obj]['input']) {
            if (!dic[obj]['input'].hasOwnProperty(input)) continue;
            graph.setEdge(nodeKey, dic[obj]['input'][input]);
          }
        }

        for (let input in dic[obj]['input']) {
          if (!dic[obj]['input'].hasOwnProperty(input)) continue;
          for (let output in dic[obj]['output']) {
            if (!dic[obj]['output'].hasOwnProperty(output)) continue;

            if (this.graphConfig.drawTempNode === true) {
              let nodeKey = obj;
              let outputPadding = ' '.repeat(Math.floor(nodeKey.length/2));
              this.setGraphNode(graph,
                                nodeKey, nodeKey + outputPadding, 'diamond', 'output', this.getOutputNodeStyle());
              graph.setEdge(dic[obj]['input'][input], nodeKey);
              graph.setEdge(nodeKey, dic[obj]['output'][output]);
            } else {
              graph.setEdge(dic[obj]['input'][input], dic[obj]['output'][output]);
            }
          }
        }
      }
    },
    restoreImage(thenDownload) {
      let chartScope = this;
      let svg = d3.select('svg');
      this.imageWidth = this.originImageWidth;
      this.imageHeight = this.originImageHeight;

      if (thenDownload) {
        svg.transition()
          .duration(750)
          .call(this.graphZoom.transform, d3.zoomIdentity.translate(0, 0))
          .on('end', function() {
            let svg = chartScope.$refs.graphSvg;
            saveSvgAsPng(svg, 'graph.png', {scale: 1.0});
        });
      } else {
        svg.transition()
          .duration(750)
          .call(this.graphZoom.transform, d3.zoomIdentity.translate(0, 0));
      }
      this.$emit('triggerRestore', false);
    },
  },
  created() {
    // scale
    let linearScale = d3.scaleLinear();
    linearScale.domain([0.1, 1]);
    linearScale.range([0.75, 1.25]);
    this.zoomScale = linearScale;
  },
  mounted() {
    // some model is too large to draw in dagred3, so don't draw input and output node in default

    let chartScope = this;
    getPluginGraphsGraph().then(({errno, data}) => {
      if (has(data, 'data') === false) {
        return;
      }

      let graphData = data.data;
      if (has(graphData, 'node') === false) {
        return;
      }

      // d3 svg drawing
      let g = new dagreD3.graphlib.Graph()
        .setGraph({})
        .setDefaultEdgeLabel(function() {
          return {};
      });

      // eslint-disable-next-line
      let render = new dagreD3.render();

      if (has(graphData, 'input') === true && this.graphConfig.drawInputNode === true) {
        for (let i = 0; i < graphData['input'].length; ++i) {
          let name = graphData['input'][i]['name'];
          this.graphConfig.inputMap[name] = i;
        }
      }
      this.buildGraph(g, graphData);

      let svg = d3.select('svg')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '28px');

      render(d3.select('svg g'), g);
      let graphSelection = d3.select('svg g');
      let graphWidth = g.graph().width;
      let graphHeight = g.graph().height;

      svg.attr('viewBox', '0 0 ' + graphWidth + ' ' + graphHeight);

      this.imageWidth = graphWidth * 1.1;
      this.imageHeight = graphHeight;
      this.originImageWidth = graphWidth * 1.1;
      this.originImageHeight = graphHeight;

      // zooming
      let zooming = function(d) {
        graphSelection.attr('transform', d3.event.transform);
        let newViewBoxWidth = d3.event.transform.k * graphWidth;
        let newViewBoxHeight = d3.event.transform.k * graphHeight;
        chartScope.imageWidth = newViewBoxWidth;
        chartScope.imageHeight = newViewBoxHeight;
      };

      let zoom = d3.zoom().on('zoom', zooming);
      chartScope.graphZoom = zoom;

      // TODO(daming-lu): enable zoom would have conflict with scale slider
      // need to find a coordinated way to handle panning and zooming.
      // svg.call(zoom);

      svg.selectAll('.node').on('click', function(d, i) {
        let curNode = g.node(d);
        let nodeType = curNode.class;
        let nodeInfo = null;
        if (nodeType === 'operator') {
          let opIndex = d.slice(7); // remove prefix "opNode_"
          nodeInfo = graphData.node[opIndex];
        } else if (nodeType === 'input') {
          nodeInfo = graphData.input[this.graphConfig.inputMap[d]];
        } else {
          nodeInfo = 'output';
        }

        chartScope.$emit('curNodeUpdated',
                         {
                           'nodeType': nodeType,
                           'nodeInfo': nodeInfo,
        });
      });
    });
  },
};
</script>
<style lang="stylus">
    .node
        cursor: pointer
    .edgePath path.path
        stroke: #333
        stroke-width: 1.5px

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
