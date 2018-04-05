<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-chart
        :fit-screen="fitScreen"
        :download="download"
        :scale="config.scale"
        :cur-node="curNode"
        @curNodeUpdated="curNode = $event"
      />
    </div>
    <div class="visual-dl-page-right">
      <div class="visual-dl-page-config-container">
        <ui-config
          :config="config"
          :cur-node="curNode"
          @fitScreen="handleFitScreen"
          @download="handleDownload"
        />
      </div>
    </div>
  </div>
</template>

<script>
import autoAdjustHeight from '../common/util/autoAdjustHeight';
import Config from './ui/Config';
import Chart from './ui/Chart';


export default {
    components: {
        'ui-config': Config,
        'ui-chart': Chart,
    },
    name: 'Graph',
    data() {
        return {
            config: {
                scale: 0.5,
            },
            fitScreen: {fitScreen: false},
            download: {download: false},
            curNode: {},
        };
    },
    mounted() {
        autoAdjustHeight();
    },
    methods: {
        handleFitScreen() {
            this.fitScreen = {fitScreen: true};
            this.config.scale = 0.5;
        },
        handleDownload() {
            this.download = {fitScreen: true};
        },
    },
};

</script>

<style lang="stylus">

</style>
