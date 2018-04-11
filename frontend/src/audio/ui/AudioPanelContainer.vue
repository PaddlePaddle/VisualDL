<template>
  <div class="visual-dl-chart-page">
    <ui-expand-panel
      :info="total"
      :title="title">
      <ui-audio
        class="visual-dl-chart-audio"
        v-for="(tagInfo, index) in filteredPageList"
        :key="index"
        :tag-info="tagInfo"
        :runs="config.runs"
        :running="config.running"
        :runs-items="runsItems"
      />

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
import AudioPanel from './AudioPanel';

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
    'ui-audio': AudioPanel,
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
      let list = this.filteredRunsList || [];
      return list.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
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
      pageSize: 8,
    };
  },
};
</script>
<style lang="stylus">
@import '~style/variables';

+prefix-classes('visual-dl-')
    .chart-page
        .audio-chart-box
            overflow hidden
            float left
            .visual-dl-chart-audio
                float left
        .audio-chart-box:after
            content ""
            clear both
            display block
        .sm-pagination
            height 50px
            float left
            width 100%
</style>


