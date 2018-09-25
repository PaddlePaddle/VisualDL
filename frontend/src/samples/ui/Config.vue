<template>
  <div class="visual-dl-page-config-com">
    <v-checkbox
      class="visual-dl-page-config-checkbox"
      label="Image"
      v-model="config.image.display"
      :disabled="!config.image.enabled"
      dark/>

    <div class="visual-dl-page-component-block">
        <v-checkbox
          class="visual-dl-page-subconfig-checkbox"
          label="Show actual image size"
          v-model="config.isActualImageSize"
          dark
          :disabled="!config.image.display"/>
    </div>

    <v-checkbox
      class="visual-dl-page-config-checkbox"
      label="Audio"
      v-model="config.audio.display"
      :disabled="!config.audio.enabled"
      dark/>

    <v-checkbox
      class="visual-dl-page-config-checkbox"
      label="Text"
      v-model="config.text.display"
      :disabled="!config.text.enabled"
      dark/>

    <v-btn
      :color="config.running ? 'primary' : 'error'"
      v-model="config.running"
      v-if="!isDemo"
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
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isDemo: process.env.NODE_ENV === 'demo',
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
        .component-block
            padding-left 33px
            padding-bottom 20px
            margin-top -10px
        .disabled-text
            opacity 0.5
        .run-toggle
            margin-top 20px
        .config-checkbox label
            font-size 13px
            font-weight bold
        .subconfig-checkbox
            margin-top 10px
        .subconfig-checkbox label
            font-size 12px

.input-group--select .input-group__selections__comma
    font-size 12px

</style>


