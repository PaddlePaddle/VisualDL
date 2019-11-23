<template>
  <div class="visual-dl-page-config-com">

    <v-text-field
      :label="$t('lang.search')"
      :hint="$t('lang.searchByLabel')"
      v-model="config.searchText"
      dark
    />


    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label="$t('lang.displayAllLabel')"
      v-model="config.displayWordLabel"
      dark/>

    <v-radio-group
      :label="$t('lang.dimension')"
      v-model="config.dimension"
      dark>
      <v-radio
        :label="$t('lang.2D')"
        value="2"/>
      <v-radio
        :label="$t('lang.3D')"
        value="3"/>
    </v-radio-group>

    <v-radio-group
      :label="$t('lang.reductionMethod')"
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
      {{ config.running ? $t('lang.startRunning') : $t('lang.stopRunning') }}
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
            isDemo: process.env.NODE_ENV === 'demo'
        };
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
