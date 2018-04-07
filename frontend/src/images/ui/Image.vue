<template>
  <v-card
    hover
    class="visual-dl-image">
    <h3 class="visual-dl-image-title">{{ tagInfo.tag.displayName }}
      <span class="visual-dl-image-run-icon">{{ tagInfo.run }}</span>
    </h3>
    <p>
      <span>Step:</span>
      <span>{{ imgData.step }}</span>
      <span class="visual-del-image-time">{{ imgData.wallTime | formatTime }}</span>
    </p>
    <v-slider
      :max="steps"
      :min="slider.min"
      :step="1"
      v-model="currentIndex"
    />

    <img
      :width="imageWidth"
      :height="imageHeight"
      :src="imgData.imgSrc" >
  </v-card>
</template>
<script>
import {getPluginImagesImages} from '../../service';

const defaultImgWidth = 400;
const defaultImgHeight = 300;
// the time to refresh chart data
const intervalTime = 30;

export default {
  props: {
    runsItems: {
      type: Array,
      required: true,
    },
    tagInfo: {
      type: Object,
      required: true,
    },
    runs: {
      type: Array,
      required: true,
    },
    running: {
      type: Boolean,
      required: true,
    },
    isActualImageSize: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    steps() {
      let data = this.data || [];
      return data.length - 1;
    },
    imageWidth() {
      return this.isActualImageSize ? this.imgData.width : defaultImgWidth;
    },
    imageHeight() {
      return this.isActualImageSize ? this.imgData.height : defaultImgHeight;
    },
  },
  filters: {
    formatTime: function(value) {
      if (!value) {
        return;
      }
      // The value was made in seconds, must convert it to milliseconds
      let time = new Date(value * 1000);
      let options = {
        weekday: 'short', year: 'numeric', month: 'short',
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
      };
      return time.toLocaleDateString('en-US', options);
    },
  },
  data() {
    return {
      currentIndex: 0,
      slider: {
        value: '0',
        label: '',
        min: 0,
        step: 1,
      },
      imgData: {},
      data: [],
      height: defaultImgHeight,
      weight: defaultImgWidth,
    };
  },
  created() {
    this.getOriginChartsData();
  },
  mounted() {
    if (this.running) {
      this.startInterval();
    }
  },

  beforeDestroy() {
    this.stopInterval();
  },

  watch: {
    running: function(val) {
      val ? this.startInterval() : this.stopInterval();
    },
    currentIndex: function(index) {
      /* eslint-disable fecs-camelcase */
      if (this.data && this.data[index]) {
        let currentImgInfo = this.data ? this.data[index] : {};
        let {height, width, query, step, wallTime} = currentImgInfo;
        let url = '/data/plugin/images/individualImage?ts=' + wallTime;
        let imgSrc = [url, query].join('&');
        this.imgData = {
          imgSrc,
          height,
          width,
          step,
          wallTime,
        };
      }
      /* eslint-enable fecs-camelcase */
    },
  },
  methods: {
    stopInterval() {
      clearInterval(this.getOringDataInterval);
    },
    // get origin data per {{intervalTime}} seconds
    startInterval() {
      this.getOringDataInterval = setInterval(() => {
        this.getOriginChartsData();
      }, intervalTime * 1000);
    },
    getOriginChartsData() {
      // let {run, tag} = this.tagInfo;
      let run = this.tagInfo.run;
      let tag = this.tagInfo.tag;
      let {displayName, samples} = tag;
      let params = {
        run,
        tag: displayName,
        samples,
      };
      getPluginImagesImages(params).then(({status, data}) => {
        if (status === 0) {
          this.data = data;
          this.currentIndex = data.length - 1;
        }
      });
    },
  },
};
</script>
<style lang="stylus">
    .visual-dl-image
        font-size 12px
        width 420px
        float left
        margin 20px 30px 10px 0
        background #fff
        padding 10px
        .visual-dl-image-title
            font-size 14px
            line-height 30px
            .visual-dl-image-run-icon
                background #e4e4e4
                float right
                margin-right 10px
                padding 0 10px
                border solid 1px #e4e4e4
                border-radius 6px
                line-height 20px
                margin-top 4px
        .visual-del-image-time
            float right
</style>

