<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-chart
        :do-download="doDownload"
        :cur-node="curNode"
        @curNodeUpdated="curNode = $event"
        @triggerDownload="doDownload = $event"
      />
    </div>
    <div class="visual-dl-page-right">
      <div class="visual-dl-page-config-container">
        <ui-config
          :cur-node="curNode"
          :do-download="doDownload"
          @triggerDownload="doDownload = $event"
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
      doDownload: false,
      curNode: {},
    };
  },
  mounted() {
    autoAdjustHeight();
  },
  methods: {},
};

</script>

<style lang="stylus">

</style>
