<template>
  <div class="visual-dl-chart-page">
    <div
      ref="chartPageBox"
      class="visual-dl-chart-page-box">

      <ui-scalar-chart
        v-for="(tagInfo, index) in filteredScalarTagList"
        :tag-info="tagInfo"
        :smoothing="config.smoothing"
        :horizontal="config.horizontal"
        :sorting-method="config.sortingMethod"
        :outlier="config.outlier"
        :runs="config.runs"
        :running="config.running"
      />

      <ui-histogram-chart
        v-for="(tagInfo, index) in filteredHistogramTagList"
        :tag-info="tagInfo"
        :runs="config.runs"
        :chart-type="config.chartType"
        :running="config.running"
      />

    </div>
    <v-pagination
      v-if="total > pageSize"
      v-model="currentPage"
      :length="pageLength"
    />
  </div>
</template>
<script>
import ExpandPanel from '../../common/component/ExpandPanel';
import ScalarChart from './ScalarChart';
import HistogramChart from './HistogramChart';

export default {
  components: {
    'ui-scalar-chart': ScalarChart,
    'ui-histogram-chart': HistogramChart,
    'ui-expand-panel': ExpandPanel,
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
    tagList: {
      type: Object,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      // current page
      currentPage: 1,
      // item per page
      pageSize: 4,
    };
  },
  computed: {
    filteredScalarTagList() {
      return this.tagList.scalar.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    },
    filteredHistogramTagList() {
      let offset = this.tagList.scalar.length;
      let start = (this.currentPage - 1) * this.pageSize - offset;
      if (start < 0) start = 0;
      let end = this.currentPage * this.pageSize - offset;
      if (end < 0) end = 0;
      return this.tagList.histogram.slice(start, end);
    },
    pageLength() {
      return Math.ceil(this.total / this.pageSize);
    },
  },
  watch: {
    'config.runs': function(val) {
      this.currentPage = 1;
    },
    'tagList': function(val) {
      this.currentPage = 1;
    },
  },
};
</script>
<style lang="stylus">
@import '~style/variables';

+prefix-classes('visual-dl-')
    .chart-page
        .chart-page-box:after
            content: "";
            clear: both;
            display: block;
            padding-bottom: 2%
</style>


