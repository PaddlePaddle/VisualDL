<template>
  <div class="visual-dl-page-config-com">
    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label=this.keyConfig.kImageValue.title
      v-model="config.image.display"
      :disabled="!config.image.enabled"
      dark/>

    <div class="visual-dl-page-component-block">
      <v-checkbox
        class="visual-dl-page-subconfig-checkbox"
        :label=this.keyConfig.kShowActualImageSize.title
        v-model="config.isActualImageSize"
        dark
        :disabled="!config.image.display"/>
    </div>

    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label=this.keyConfig.kAudioValue.title
      v-model="config.audio.display"
      :disabled="!config.audio.enabled"
      dark/>

    <v-checkbox
      class="visual-dl-page-config-checkbox"
      :label=this.keyConfig.kTextValue.title
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
        kTextValue: {
          title: '',
          key: 'text',
        },
        kImageValue: {
          title: '',
          key: 'image',
        },
        kAudioValue: {
          title: '',
          key: 'audio',
        },
        kStartRunning: {
          title: '',
          key: 'startRunning',
        },
        kStopRunning: {
          title: '',
          key: 'stopRunning',
        },
        kShowActualImageSize: {
          title: '',
          key: 'showActualImageSize',
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


