<template>
  <div class="visual-dl-chart-page">
    <ui-expand-panel
      :info="total"
      :title="title">

      <div class="visual-dl-sample-chart-box">
        <ui-image
          v-for="(tagInfo, index) in filteredImageTagList"
          :key="index"
          :tag-info="tagInfo"
          :is-actual-image-size="config.isActualImageSize"
          :runs="config.runs"
          :running="config.running"
        />
      </div>
      <div class="visual-dl-sample-chart-box">
        <ui-audio
          v-for="(tagInfo, index) in filteredAudioTagList"
          :key="index"
          :tag-info="tagInfo"
          :runs="config.runs"
          :running="config.running"
        />
      </div>
      <div class="visual-dl-sample-chart-box">
        <ui-text
          v-for="(tagInfo, index) in filteredTextTagList"
          :key="index"
          :tag-info="tagInfo"
          :runs="config.runs"
          :running="config.running"
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
import Image from './Image';
import Audio from './Audio';
import Text from './Text';

import {cloneDeep, flatten} from 'lodash';

export default {
  components: {
    'ui-image': Image,
    'ui-audio': Audio,
    'ui-text': Text,
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
      pageSize: 12,
    };
  },
  computed: {
    filteredListByRunsForImage() {
      if (!this.config.image.display) return [];
      let runs = this.config.runs || [];
      let list = cloneDeep(this.tagList.image) || [];
      return flatten(list.slice().map((item) => {
        return item.tagList.filter((one) => runs.includes(one.run));
      }));
    },
    filteredListByRunsForAudio() {
      if (!this.config.audio.display) return [];
      let runs = this.config.runs || [];
      let list = cloneDeep(this.tagList.audio) || [];
      return flatten(list.slice().map((item) => {
        return item.tagList.filter((one) => runs.includes(one.run));
      }));
    },
    filteredListByRunsForText() {
      if (!this.config.text.display) return [];
      let runs = this.config.runs || [];
      let list = cloneDeep(this.tagList.text) || [];
      return flatten(list.slice().map((item) => {
        return item.tagList.filter((one) => runs.includes(one.run));
      }));
    },
    filteredImageTagList() {
        return this.filteredListByRunsForImage.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    },
    filteredAudioTagList() {
        let offset = this.filteredListByRunsForImage.length;
        let start = (this.currentPage - 1) * this.pageSize - offset;
        if (start < 0) start = 0;
        let end = this.currentPage * this.pageSize - offset;
        if (end < 0) end = 0;
        return this.filteredListByRunsForAudio.slice(start, end);
    },
    filteredTextTagList() {
        let offset = this.filteredListByRunsForImage.length + this.filteredListByRunsForAudio.length;
        let start = (this.currentPage - 1) * this.pageSize - offset;
        if (start < 0) start = 0;
        let end = this.currentPage * this.pageSize - offset;
        if (end < 0) end = 0;
        return this.filteredListByRunsForText.slice(start, end);
    },
    total() {
      let imageList = this.filteredListByRunsForImage || [];
      let audioList = this.filteredListByRunsForAudio || [];
      let textList = this.filteredListByRunsForText || [];
      return imageList.length + audioList.length + textList.length;
    },
    pageLength() {
      return Math.ceil(this.total / this.pageSize);
    },
  },
  watch: {
    'config.runs': function(val) {
      this.currentPage = 1;
    }
  },
};
</script>
<style lang="stylus">
@import '~style/variables';

+prefix-classes('visual-dl-')
    .chart-page
        .sample-chart-box
            overflow hidden
            float left
            .visual-dl-chart-image
                float left
        .sample-chart-box:after
            content ""
            clear both
            display block
        .sm-pagination
            height 50px
            float left
            width 100%
</style>


