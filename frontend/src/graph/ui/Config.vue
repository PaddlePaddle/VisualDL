<template>
  <div class="visual-dl-graph-config-com">
    <div class="graph-config-upper">
      <v-btn
        class="visual-dl-graph-config-button"
        color="primary"
        @click="handleDownload"
        dark>
        <v-icon style="margin-right: 6px">file_download</v-icon>
        {{ $t("lang.downloadImage") }}
      </v-btn>

      <v-btn
        class="visual-dl-graph-config-button"
        color="primary"
        @click="resetImage"
        dark>
        <v-icon style="margin-right: 6px">restore</v-icon>
        {{ $t("lang.restoreImage") }}
      </v-btn>

      <v-slider
        :label="$t('lang.scale')"
        max="1"
        min="0.1"
        step="0.1"
        v-model="config.scale"
        dark/>
    </div>


    <div class="node-info">
      <h3>{{ $t("lang.nodeInfo") }}: </h3>

      <div v-if="curNode.nodeType === 'input'">
        <div>{{ $t("lang.nodeType") }}: {{ curNode.nodeType }}</div>
        <div>{{ $t("lang.nodeName") }}: {{ curNode.nodeInfo.name }}</div>
        <div>{{ $t("lang.dataShape") }}: {{ curNode.nodeInfo.shape }}</div>
        <div>{{ $t("lang.dataType") }}: {{ curNode.nodeInfo.data_type }}</div>
      </div>
      <div v-else-if="curNode.nodeType === 'output'">
        <div>{{ $t("lang.nodeType") }}: {{ curNode.nodeType }}</div>
      </div>
      <div v-else-if="curNode.nodeType === 'operator'">
        <div>{{ $t("lang.nodeType") }}: {{ curNode.nodeType }}</div>
        <div>{{ $t("lang.input") }}: {{ curNode.nodeInfo.input }}</div>
        <div>{{ $t("lang.opType") }}: {{ curNode.nodeInfo.opType }}</div>
        <div>{{ $t("lang.output") }}: {{ curNode.nodeInfo.output }}</div>
      </div>
      <div v-else/>
    </div>
  </div>
</template>
<script>

export default {
  props: {
    'doDownload': {
      type: Boolean,
      required: true,
    },
    'curNode': {
      type: Object,
      default: {},
    },
    'config': {
      type: Object,
      required: true,
    },
  }, methods: {
    handleDownload() {
      this.$emit('triggerDownload', true);
    },
    resetImage() {
      this.$emit('triggerRestore', true);
    },
  },
};
</script>
<style lang="stylus">
@import '../../style/variables';
+prefix-classes('visual-dl-graph-')
    .config-com
        width 90%
        margin 20px auto
        color $-right-font-color
        .config-button
            width 200px
            margin-top 20px
.visual-dl-graph-config-com
    .sm-icon
        width 36px
        height 26px

.graph-config-upper
    height 300px

.node-info
  font-family 'Courier New', sans-serif
  font-weight bold

</style>
