<template>
  <div class="visual-dl-page-config-com">
    <v-text-field
      label="Group name RegExp"
      hint="input a tag group name to search"
      v-model="config.groupNameReg"
      dark
    />

    <v-radio-group
      label="Histogram mode"
      v-model="config.chartType"
      dark>
      <v-radio
        v-for="mode in chartTypeItems"
        :key="mode.name"
        :label="mode.name"
        :value="mode.value"/>
    </v-radio-group>

    <label class="visual-dl-page-checkbox-group-label">Runs</label>
    <v-checkbox
      v-for="item in runsItems"
      :key="item.name"
      :label="item.name"
      :value="item.value"
      v-model="config.runs"
      dark
    />

    <v-btn
      class="visual-dl-page-run-toggle"
      :color="config.running ? 'primary' : 'error'"
      v-model="config.running"
      @click="toggleAllRuns"
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
      chartTypeItems: [
        {
          name: 'Overlay',
          value: 'overlay',
        },
        {
          name: 'Offset',
          value: 'offset',
        },
      ],
    };
  },
  methods: {
    toggleAllRuns() {
      let running = this.config.running;
      this.config.running = !running;
    },
  },
};
</script>
<style lang="stylus">
+prefix-classes('visual-dl-page-')
    .config-com
        padding 20px
        .run-toggle
            margin-top 20px
        .checkbox-group-label
            display flex
            margin-top 20px
            margin-bottom 10px
</style>


