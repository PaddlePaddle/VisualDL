<template>
  <div class="visual-dl-page-config-com">

    <v-text-field
      :label=this.keyConfig.kSearch.title
      :hint=this.keyConfig.kSearchByLabel.title
      v-model="config.searchText"
      dark
    />


    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label=this.keyConfig.kDisplayAllLabel.title
      v-model="config.displayWordLabel"
      dark/>

    <v-radio-group
      :label=this.keyConfig.kDimension.title
      v-model="config.dimension"
      dark>
      <v-radio
        :label=this.keyConfig.k2D.title
        value="2"/>
      <v-radio
        :label=this.keyConfig.k3D.title
        value="3"/>
    </v-radio-group>

    <v-radio-group
      :label=this.keyConfig.kReductionMethod.title
      v-model="config.reduction"
      dark>
      <v-radio
        label="PCA"
        value="pca"/>
      <v-radio
        label="T-SNE"
        value="tsne"/>

    </v-radio-group>

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
      language: '',
      keyConfig: {
        kSearch: {
          title: '',
          key: 'search',
        },
        kSearchByLabel: {
          title: '',
          key: 'searchByLabel',
        },
        kDisplayAllLabel: {
          title: '',
          key: 'displayAllLabel',
        },
        kDimension: {
          title: '',
          key: 'dimension',
        },
        k2D: {
          title: '',
          key: '2D',
        },
        k3D: {
          title: '',
          key: '3D',
        },
        kStartRunning: {
          title: '',
          key: 'startRunning',
        },
        kStopRunning: {
          title: '',
          key: 'stopRunning',
        },
        kReductionMethod: {
          title: '',
          key: 'reductionMethod',
        },
      },
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
    },
  },
};

</script>
<style lang="stylus">
+prefix-classes('visual-dl-page-')
    .config-com
        padding 20px
        .slider-block
            display flex
            align-items center
        .smoothing-slider
            display inline
        .slider-span
            width 40px
        .run-toggle
            margin-top 20px
        .config-selector
            margin-top 12px
            margin-bottom 20px
        .checkbox-group-label
            display flex
            margin-top 20px
            margin-bottom 10px

</style>
