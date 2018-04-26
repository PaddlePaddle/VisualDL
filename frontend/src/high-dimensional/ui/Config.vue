<template>
  <div class="visual-dl-page-config-com">

    <v-text-field
      label="Search"
      hint="Search by label"
      v-model="config.searchText"
      dark
    />


    <v-checkbox
      class="visual-dl-page-config-checkbox"
      label="Display All Labels"
      v-model="config.displayWordLabel"
      dark/>

    <v-radio-group
      label="Dimension"
      v-model="config.dimension"
      dark>
      <v-radio
        label="2D"
        value="2"/>
      <v-radio
        label="3D"
        value="3"/>
    </v-radio-group>

    <v-radio-group
      label="Reduction Method"
      v-model="config.reduction"
      dark>
      <v-radio
        label="PCA"
        value="pca"/>
      <v-radio
        label="T-SNE"
        value="tsne"/>

    </v-radio-group>

    <v-radio-group
      label="Run"
      v-model="config.selectedRun"
      dark>
      <v-radio
        v-for="item in runsItems"
        :key="item.name"
        :label="item.name"
        :value="item.value" />
    </v-radio-group>

    <v-btn
      :color="config.running ? 'primary' : 'error'"
      v-model="config.running"
      @click="toggleAllRuns"
      class="visual-dl-page-run-toggle"
      dark
      block
    >
      {{ config.running ? 'Running' : 'Stopped' }}
    </v-btn>
  </div>
</template>
<script>

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
  },
  data() {
    return {
    };
  },
  methods: {
    toggleAllRuns() {
      this.config.running = !this.config.running;
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
