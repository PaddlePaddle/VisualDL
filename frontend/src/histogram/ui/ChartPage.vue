<template>
  <!-- ClassName visual-dl-chart-page used in chart.san, change they all if you need!-->
  <div class="visual-dl-chart-page">
    <ui-expand-panel
      :info="total"
      :title="title">
      <div class="visual-dl-chart-page-box">
        <ui-chart
          v-for="(tagInfo, index) in filteredPageList"
          :key="index"
          :tag-info="tagInfo"
          :runs="config.runs"
          :chart-type="config.chartType"
          :running="config.running"
          :runs-items="runsItems"
        />
      </div>
      <v-pagination
        class="visual-dl-sm-pagination"
        v-if="total > pageSize"
        v-model="currentPage"
        :length="pageLength"
      />
    </ui-expand-panel>
  </div>
</template>
<script>
import ExpandPanel from '../../common/component/ExpandPanel';
import Chart from './Chart';

import {cloneDeep, flatten} from 'lodash';

export default {
  props: {
    runsItems: {
      type: Array,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    tagList: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  components: {
    'ui-chart': Chart,
    'ui-expand-panel': ExpandPanel,
  },
  computed: {
    filteredRunsList() {
      let tagList = this.tagList || [];
      let runs = this.config.runs || [];
      let list = cloneDeep(tagList);
      return flatten(list.slice().map((item) => {
        return item.tagList.filter((one) => runs.includes(one.run));
      }));
    },

    filteredPageList() {
      let list = this.filteredRunsList;
      let currentPage = this.currentPage;
      let pageSize = this.pageSize;
      return list.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    },
    total() {
      let list = this.filteredRunsList || [];
      return list.length;
    },
    pageLength() {
      return Math.ceil(this.total / this.pageSize);
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

  methods: {
    handlePageChange({pageNum}) {
      this.currentPage = pageNum;
    },
  },
};
</script>
<style lang="stylus">
@import '../../style/variables';

+prefix-classes('visual-dl-')
    .chart-page
        .chart-box
            float left
        .chart-page-box:after
            content: "";
            clear: both;
            display: block;
            padding-bottom: 2%
</style>
