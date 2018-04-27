<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-chart
        :config="config"
        :display-word-label="config.displayWordLabel"
        :search-text="config.searchText"
        :dimension="config.dimension"
        :embedding-data="embeddingData"
        :show-loading="showLoading"
      />
    </div>
    <div class="visual-dl-page-right">
      <div class="visual-dl-page-config-container">
        <ui-config
          :runs-items="runsItems"
          :config="config"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {getHighDimensionalDatasets, getRuns} from '../service';
import autoAdjustHeight from '../common/util/autoAdjustHeight';
import Config from './ui/Config';
import Chart from './ui/Chart';

// the time to refresh chart data
const intervalTime = 30;

export default {
  components: {
    'ui-config': Config,
    'ui-chart': Chart,
  },
  name: 'HighDimensional',
  data() {
    return {
      runsArray: [],
      config: {
        searchText: '',
        displayWordLabel: true,
        dimension: '2',
        reduction: 'pca',
        selectedRun: '',
        running: true,
      },
      embeddingData: [],
      showLoading: false,
    };
  },
  created() {
    getRuns().then(({errno, data}) => {
      this.runsArray = data;

      // Setting selectedRun should trigger fetchDatasets
      if (data.length > 0) {
        this.config.selectedRun = data[0];
      }
    });

    if (this.config.running) {
      this.startInterval();
    }
  },
  beforeDestroy() {
    this.stopInterval();
  },
  watch: {
    'config.dimension': function(val) {
      this.fetchDatasets();
    },
    'config.reduction': function(val) {
      this.fetchDatasets();
    },
    'config.selectedRun': function(val) {
      this.fetchDatasets();
    },
    'config.running': function(val) {
      val ? this.startInterval() : this.stopInterval();
    },
  },
  mounted() {
    autoAdjustHeight();
  },
  computed: {
    runsItems() {
      let runsArray = this.runsArray || [];
      return runsArray.map((item) => {
        return {
          name: item,
          value: item,
        };
      });
    },
  },
  methods: {
    stopInterval() {
      clearInterval(this.getOringDataInterval);
    },
    // get origin data per {{intervalTime}} seconds
    startInterval() {
      this.getOringDataInterval = setInterval(() => {
        this.fetchDatasets();
      }, intervalTime * 1000);
    },
    fetchDatasets() {
      this.showLoading = true;

      // Fetch the data from the server. Passing dimension and reduction method
      let params = {
        dimension: this.config.dimension,
        reduction: this.config.reduction,
        run: this.config.selectedRun,
      };
      getHighDimensionalDatasets(params).then(({errno, data}) => {
        this.showLoading = false;

        let vectorData = data.embedding;
        let labels = data.labels;

        for ( let i = 0; i < vectorData.length; i ++) {
          vectorData[i].push(labels[i]);
        }

        this.embeddingData = vectorData;
      });
    },
  },
};

</script>

<style lang="stylus">

</style>
