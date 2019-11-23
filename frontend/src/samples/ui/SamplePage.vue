<template>
  <div class="visual-dl-chart-page">

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
  </div>
</template>
<script>
import Image from './Image';
import Audio from './Audio';
import Text from './Text';

export default {
    components: {
        'ui-image': Image,
        'ui-audio': Audio,
        'ui-text': Text
    },
    props: {
        config: {
            type: Object,
            required: true
        },
        tagList: {
            type: Object,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            // current page
            currentPage: 1,
            // item per page
            pageSize: 12
        };
    },
    computed: {
        filteredImageTagList() {
            return this.tagList.image.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
        },
        filteredAudioTagList() {
            let offset = this.tagList.image.length;
            let start = (this.currentPage - 1) * this.pageSize - offset;
            if (start < 0) start = 0;
            let end = this.currentPage * this.pageSize - offset;
            if (end < 0) end = 0;
            return this.tagList.audio.slice(start, end);
        },
        filteredTextTagList() {
            let offset = this.tagList.image.length + this.tagList.audio.length;
            let start = (this.currentPage - 1) * this.pageSize - offset;
            if (start < 0) start = 0;
            let end = this.currentPage * this.pageSize - offset;
            if (end < 0) end = 0;
            return this.tagList.text.slice(start, end);
        },
        pageLength() {
            return Math.ceil(this.total / this.pageSize);
        }
    },
    watch: {
        'config.runs': function (val) {
            this.currentPage = 1;
        },
        tagList: function (val) {
            this.currentPage = 1;
        }
    }
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


