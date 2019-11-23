<template>
  <div class="visual-dl-page-config-com">
    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label="$t('lang.scalars')"
      v-model="config.scalar.display"
      :disabled="!config.scalar.enabled"
      dark/>

    <div class="visual-dl-page-component-block">

      <div class="visual-dl-page-control-block">
        <span :class="'visual-dl-page-control-span' + (config.scalar.display ? '' : ' visual-dl-page-disabled-text')">{{ $t("lang.smoothing") }}</span>
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
        <span :class="'visual-dl-page-control-span' + (config.scalar.display ? '' : ' visual-dl-page-disabled-text')">{{ $t("lang.xAxis") }}</span>
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
        <span :class="'visual-dl-page-control-span' + (config.scalar.display ? '' : ' visual-dl-page-disabled-text')">{{ $t("lang.toolTipSorting") }}</span>
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
        :label="$t('lang.ignoreOutliers')"
        v-model="config.outlier"
        dark
        :disabled="!config.scalar.display"/>

    </div>

    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label="$t('lang.histogram')"
      v-model="config.histogram.display"
      :disabled="!config.histogram.enabled"
      dark/>

    <div class="visual-dl-page-component-block">
      <div class="visual-dl-page-control-block">
        <span :class="'visual-dl-page-control-span' + (config.histogram.display ? '' : ' visual-dl-page-disabled-text')">{{ $t("lang.mode") }}</span>
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
      {{ config.running ? $t("lang.startRunning") : $t("lang.stopRunning") }}
    </v-btn>
  </div>
</template>
<script>

export default {
    props: {
        config: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            smoothingValue: this.config.smoothing,
            isDemo: process.env.NODE_ENV === 'demo'
        };
    },
    computed: {
        sortingMethodItems() {
            return [
                {
                    text: this.$i18n.t('lang.default'),
                    value: 'default'
                },
                {
                    text: this.$i18n.t('lang.descending'),
                    value: 'descending'
                },
                {
                    text: this.$i18n.t('lang.ascending'),
                    value: 'ascending'
                },
                {
                    text: this.$i18n.t('lang.nearest'),
                    value: 'nearest'
                }
            ];
        },
        chartTypeItems() {
            return [
                {
                    text: this.$i18n.t('lang.overlay'),
                    value: 'overlay'
                },
                {
                    text: this.$i18n.t('lang.offset'),
                    value: 'offset'
                }
            ];
        },
        horizontalItems() {
            return [
                {
                    text: this.$i18n.t('lang.step'),
                    value: 'step'
                },
                {
                    text: this.$i18n.t('lang.relative'),
                    value: 'relative'
                },
                {
                    text: this.$i18n.t('lang.wall'),
                    value: 'wall'
                }
            ];
        }
    },
    watch: {
        smoothingValue: _.debounce(
            function () {
                this.config.smoothing = this.smoothingValue;
            }, 50
        )
    },
    methods: {
        toggleAllRuns() {
            this.config.running = !this.config.running;
        }
    }
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


