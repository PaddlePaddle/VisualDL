<template>
  <div class="visual-dl-graph-config-com">
    <div class="graph-config-upper">
      <v-btn
        class="visual-dl-graph-config-button"
        color="primary"
        @click="handleDownload"
        dark>
        <v-icon style="margin-right: 6px">file_download</v-icon>
        {{ this.keyConfig.kDownloadImage.title }}
      </v-btn>

      <v-btn
        class="visual-dl-graph-config-button"
        color="primary"
        @click="resetImage"
        dark>
        <v-icon style="margin-right: 6px">restore</v-icon>
        {{ this.keyConfig.kRestoreImage.title }}
      </v-btn>

      <v-slider
        :label=this.keyConfig.kScale.title
        max="1"
        min="0.1"
        step="0.1"
        v-model="config.scale"
        dark/>
    </div>


    <div class="node-info">
      <h3>{{ this.keyConfig.kNodeInfo.title }}: </h3>

      <div v-if="curNode.nodeType === 'input'">
        <div>{{ this.keyConfig.kNodeType.title }}: {{ curNode.nodeType }}</div>
        <div>{{ this.keyConfig.kNodeName.title }}: {{ curNode.nodeInfo.name }}</div>
        <div>{{ this.keyConfig.kDataShape.title }}: {{ curNode.nodeInfo.shape }}</div>
        <div>{{ this.keyConfig.kDataType.title }}: {{ curNode.nodeInfo.data_type }}</div>
      </div>
      <div v-else-if="curNode.nodeType === 'output'">
        <div>{{ this.keyConfig.kNodeType.title }}: {{ curNode.nodeType }}</div>
      </div>
      <div v-else-if="curNode.nodeType === 'operator'">
        <div>{{ this.keyConfig.kNodeType.title }}: {{ curNode.nodeType }}</div>
        <div>{{ this.keyConfig.kInput.title }}: {{ curNode.nodeInfo.input }}</div>
        <div>{{ this.keyConfig.kOpType.title }}: {{ curNode.nodeInfo.opType }}</div>
        <div>{{ this.keyConfig.kOutput.title }}: {{ curNode.nodeInfo.output }}</div>
      </div>
      <div v-else/>
    </div>
  </div>
</template>
<script>
import {getValueByLanguage} from '../../language';

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
  },
  data() {
    return {
      keyConfig: {
        kDownloadImage: {
          title: '',
          key: 'downloadImage',
        },
        kRestoreImage: {
          title: '',
          key: 'restoreImage',
        },
        kScale: {
          title: '',
          key: 'scale',
        },
        kNodeInfo: {
          title: '',
          key: 'nodeInfo',
        },
        kNodeType: {
          title: '',
          key: 'nodeType',
        },
        kNodeName: {
          title: '',
          key: 'nodeName',
        },
        kDataShape: {
          title: '',
          key: 'dataShape',
        },
        kDataType: {
          title: '',
          key: 'dataType',
        },
        kInput: {
          title: '',
          key: 'input',
        },
        kOutput: {
          title: '',
          key: 'output',
        },
        kOpType: {
          title: '',
          key: 'opType',
        },
      },
      language: '',
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
    setValueByLanguage: function() {
      for (let key in this.keyConfig) {
        if (this.keyConfig.hasOwnProperty(key)) {
          let item = this.keyConfig[key];
          item.title = getValueByLanguage(this.language, item.key);
        }
      }
    },
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
