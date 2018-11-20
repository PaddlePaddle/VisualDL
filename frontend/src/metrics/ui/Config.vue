<template>
  <div class="visual-dl-page-config-com">
    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label=this.keyConfig.kScalarValue.title
      v-model="config.scalar.display"
      :disabled="!config.scalar.enabled"
      dark/>

    <div class="visual-dl-page-component-block">

      <div class="visual-dl-page-control-block">
        <span :class="'visual-dl-page-control-span' + (config.scalar.display ? '' : ' visual-dl-page-disabled-text')">{{ this.keyConfig.kSmoothing.title }}</span>
        <v-slider
          :max="0.99"
          :min="0"
          :step="0.01"
          v-model="smoothingValue"
          class="visual-dl-page-smoothing-slider"
          dark
          :disabled="!config.scalar.display"/>
        <span :class="'visual-dl-page-slider-span' + (config.scalar.display ? '' : ' visual-dl-page-disabled-text')">{{ smoothingValue }}</span>
      </div>

      <div class="visual-dl-page-control-block">
        <span :class="'visual-dl-page-control-span' + (config.scalar.display ? '' : ' visual-dl-page-disabled-text')">{{ this.keyConfig.kXAxis.title }}</span>
        <v-select
          :items="horizontalItems"
          v-model="config.horizontal"
          class="visual-dl-page-config-selector"
          dark
          dense
          :disabled="!config.scalar.display"
        />
      </div>

      <div class="visual-dl-page-control-block">
        <span :class="'visual-dl-page-control-span' + (config.scalar.display ? '' : ' visual-dl-page-disabled-text')">{{ this.keyConfig.kToolTipSorting.title }}</span>
        <v-select
          :items="sortingMethodItems"
          v-model="config.sortingMethod"
          class="visual-dl-page-config-selector"
          dark
          dense
          :disabled="!config.scalar.display"
        />
      </div>

      <v-checkbox
        class="visual-dl-page-outliers-checkbox"
        :label=this.keyConfig.kIgnoreOutliers.title
        v-model="config.outlier"
        dark
        :disabled="!config.scalar.display"/>

    </div>

    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label=this.keyConfig.kHistogram.title
      v-model="config.histogram.display"
      :disabled="!config.histogram.enabled"
      dark/>

    <div class="visual-dl-page-component-block">
      <div class="visual-dl-page-control-block">
        <span :class="'visual-dl-page-control-span' + (config.histogram.display ? '' : ' visual-dl-page-disabled-text')">{{ this.keyConfig.kMode.title }}</span>
        <v-select
          :items="chartTypeItems"
          v-model="config.chartType"
          class="visual-dl-page-config-selector"
          dark
          dense
          :disabled="!config.histogram.display"
        />
      </div>
    </div>

    <v-btn
      :color="config.running ? 'primary' : 'error'"
      v-model="config.running"
      v-if="!isDemo"
      @click="toggleAllRuns"
      class="visual-dl-page-run-toggle"
      dark
      block
    >
      {{ config.running ? this.keyConfig.kStartRunning.title : this.keyConfig.kStopRunning.title }}
    </v-btn>
  </div>
</template>
<script>
import {getValueByLanguage} from '../../language';

export default {
  props: {
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      keyConfig: {
        kScalarValue: {
          title: '',
          key: 'scalars',
        },
        kSmoothing: {
          title: '',
          key: 'smoothing',
        },
        kXAxis: {
          title: '',
          key: 'xAxis',
        },
        kToolTipSorting: {
          title: '',
          key: 'toolTipSorting',
        },
        kIgnoreOutliers: {
          title: '',
          key: 'ignoreOutliers',
        },
        kHistogram: {
          title: '',
          key: 'histogram',
        },
        kMode: {
          title: '',
          key: 'mode',
        },
        kStartRunning: {
          title: '',
          key: 'startRunning',
        },
        kStopRunning: {
          title: '',
          key: 'stopRunning',
        },
      },
      horizontalItems: [
        {
          text: 'Step',
          value: 'step',
        },
        {
          text: 'Relative',
          value: 'relative',
        },
        {
          text: 'Wall Time',
          value: 'wall',
        },
      ],
      sortingMethodItems: [
        {
          text: 'default',
          value: 'default',
        },
        {
          text: 'descending',
          value: 'descending',
        },
        {
          text: 'ascending',
          value: 'ascending',
        },
        {
          text: 'nearest',
          value: 'nearest',
        },
      ],
      chartTypeItems: [
        {
          text: 'Overlay',
          value: 'overlay',
        },
        {
          text: 'Offset',
          value: 'offset',
        },
      ],
      smoothingValue: this.config.smoothing,
      isDemo: process.env.NODE_ENV === 'demo',
    };
  },
  watch: {
    config: {
      handler: function(newval, oldval) {
        this.language = newval.language;
        this.setValueByLanguage();
      },
      deep: true,
      immediate: true,
    },
    smoothingValue: _.debounce(
      function() {
        this.config.smoothing = this.smoothingValue;
      }, 50
    ),
  },
  methods: {
    toggleAllRuns() {
      this.config.running = !this.config.running;
    },
    setValueByLanguage: function() {
      for (let key in this.keyConfig) {
        if (this.keyConfig.hasOwnProperty(key)) {
          let item = this.keyConfig[key];
          item.title = getValueByLanguage(this.language, item.key);
        }
      }
      for (let item of this.chartTypeItems) {
        item.text = getValueByLanguage(this.language, item.value);
      }
      for (let item of this.sortingMethodItems) {
        item.text = getValueByLanguage(this.language, item.value);
      }
      for (let item of this.horizontalItems) {
        item.text = getValueByLanguage(this.language, item.value);
      }
    },
  },
};

</script>
<style lang="stylus">
+prefix-classes('visual-dl-page-')
    .config-com
        padding 20px
        .component-block
            padding-left 33px
            padding-bottom 20px
            margin-top -10px
        .control-block
            height 36px
            display flex
            align-items center
        .control-span
            font-size 12px
            width 110px
            margin-top 8px
        .disabled-text
            opacity 0.5
        .smoothing-slider
            display inline
        .slider-span
            width 35px
            font-size 13px
        .run-toggle
            margin-top 20px
        .config-checkbox label
            font-size 13px
            font-weight bold
        .outliers-checkbox
            margin-top 10px
        .outliers-checkbox label
            font-size 12px

.input-group--select .input-group__selections__comma
    font-size 12px

</style>


