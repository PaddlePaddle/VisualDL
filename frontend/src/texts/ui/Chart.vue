<template>
  <v-card
    hover
    class="visual-dl-text">
    <h3 class="visual-dl-text-title">{{ tagInfo.tag.displayName }}
      <span class="visual-dl-text-run-icon">{{ tagInfo.run }}</span>
    </h3>
    <p>
      <span>Step:</span>
      <span>{{ textData.step }}</span>
      <span class="visual-del-text-time">{{ textData.wallTime | formatTime }}</span>
    </p>
    <v-slider
      :max="steps"
      :min="slider.min"
      :step="1"
      v-model="currentIndex"
    />

    <p> {{ textData.message }} </p>
  </v-card>
</template>

<script>
import {getPluginTextsTexts} from '../../service';

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
  },
  computed: {
    steps() {
      let data = this.data || [];
      return data.length - 1;
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
      textData: {},
      data: [],
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
      if (this.data && this.data[index]) {
        let currentTextInfo = this.data ? this.data[index] : {};
        let wallTime = currentTextInfo[0];
        let step = currentTextInfo[1];
        let message = currentTextInfo[2];

        this.textData = {
          step,
          wallTime,
          message,
        };
      }
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
      getPluginTextsTexts(params).then(({status, data}) => {
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
    .visual-dl-text
        font-size 12px
        width 420px
        float left
        margin 20px 30px 10px 0
        background #fff
        padding 10px
        .visual-dl-text-title
            font-size 14px
            line-height 30px
            .visual-dl-text-run-icon
                background #e4e4e4
                float right
                margin-right 10px
                padding 0 10px
                border solid 1px #e4e4e4
                border-radius 6px
                line-height 20px
                margin-top 4px
        .visual-dl-chart-actions
            .sm-form-item
                width 300px
                display inline-block
        .visual-del-text-time
            float right
</style>

