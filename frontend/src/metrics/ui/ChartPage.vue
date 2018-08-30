<template>
  <div class="visual-dl-chart-page">
    <ui-expand-panel
      :info="total"
      :title="title">
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
    </ui-expand-panel>
  </div>
</template>
<script>
import ExpandPanel from '../../common/component/ExpandPanel';
import ScalarChart from './ScalarChart';
import HistogramChart from './HistogramChart';
import {cloneDeep, flatten} from 'lodash';

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
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // current page
      currentPage: 1,
      // item per page
      pageSize: 8,
    };
  },
  computed: {
    filteredListByRunsForScalar() {
      let runs = this.config.runs || [];
      let list = cloneDeep(this.tagList.scalar) || [];
      list = list.slice().map((item) => {
        item.tagList = item.tagList.filter((one) => runs.includes(one.run));
        return item;
      });
      return list.filter((item) => item.tagList.length > 0);
    },
    filteredListByRunsForHistogram() {
      let runs = this.config.runs || [];
      let list = cloneDeep(this.tagList.histogram) || [];
      return flatten(list.slice().map((item) => {
        return item.tagList.filter((one) => runs.includes(one.run));
      }));
    },
    filteredScalarTagList() {
        console.log("filteredScalarTagList");
        return this.filteredListByRunsForScalar.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    },
    filteredHistogramTagList() {
        let offset = this.filteredListByRunsForScalar.length;
        let start = (this.currentPage - 1) * this.pageSize - offset;
        if (start < 0) start = 0;
        let end = this.currentPage * this.pageSize - offset;
        if (end < 0) end = 0;
        return this.filteredListByRunsForHistogram.slice(start, end);
    },
    total() {
      let scalarList = this.filteredListByRunsForScalar || [];
      let histogramList = this.filteredListByRunsForHistogram || [];
      return scalarList.length + histogramList.length;
    },
    pageLength() {
      return Math.ceil(this.total / this.pageSize);
    },
  },
  watch: {
    'config.runs': function(val) {
      this.currentPage = 1;
    }
  }
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


