<template>
  <div class="visual-dl-chart-page">
    <ui-expand-panel
      :info="total"
      :title="title">
      <div
        ref="chartPageBox"
        class="visual-dl-chart-page-box">

        <ui-histogram-chart
          v-for="(tagInfo, index) in filteredHistogramTagList"
          :key="index"
          :tag-info="tagInfo"
          :runs="config.runs"
          :chart-type="config.chartType"
          :running="config.running"
        />

        <ui-scalar-chart
          v-for="(tagInfo, index) in filteredScalarTagList"
          :key="index"
          :tag-info="tagInfo"
          :smoothing="config.smoothing"
          :horizontal="config.horizontal"
          :sorting-method="config.sortingMethod"
          :outlier="config.outlier"
          :runs="config.runs"
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
import {cloneDeep} from 'lodash';

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
  computed: {
//    filteredRunsList() {
//      let tagList = this.tagList || [];
//      let runs = this.config.runs || [];
//      let list = cloneDeep(tagList);
//      return list.slice().map((item) => {
//        item.tagList = item.tagList.filter((one) => runs.includes(one.run));
//        return item;
//      });
//    },
//    filteredTagList() {
//      let tagList = this.filteredRunsList || [];
//      return tagList.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
//    },

    filteredScalarTagList() {
        return this.filteredListByPage(this.filteredListByRuns(this.tagList.scalar));
    },
    filteredHistogramTagList() {
        let result = this.filteredListByPage(this.filteredListByRuns(this.tagList.histogram));

        console.log("result = ", result);
        return result;
    },
    total() {

        console.log("chartpage taglist = ", this.tagList);
      let sum;
      Object.keys(this.tagList).forEach((type) => {
        let tagList = this.tagList[type] || [];
        sum += this.tagList[type].length;
      });
      console.log("sum", sum);
      return sum;
    },
    pageLength() {
      return Math.ceil(this.total / this.pageSize);
    },
  },
  methods: {
    filteredListByRuns(list) {
      let runs = this.config.runs || [];
      list = cloneDeep(list) || [];
      return list.slice().map((item) => {
        item.tagList = item.tagList.filter((one) => runs.includes(one.run));
        return item;
      });
    },
    filteredListByPage(list) {
      return list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    }
  },
  data() {
    return {
      // current page
      currentPage: 1,
      // item per page
      pageSize: 8,
    };
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


