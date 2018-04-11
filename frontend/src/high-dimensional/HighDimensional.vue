<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-chart
        :config="config"
        :display-word-label="config.displayWordLabel"
        :search-text="config.searchText"
        :dimension="config.dimension"
        :embedding-data="embeddingData"
      />
    </div>
    <div class="visual-dl-page-right">
      <div class="visual-dl-page-config-container">
        <ui-config
          :config="config"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {getHighDimensionalDatasets} from '../service';
import autoAdjustHeight from '../common/util/autoAdjustHeight';
import Config from './ui/Config';
import Chart from './ui/Chart';

export default {
  components: {
    'ui-config': Config,
    'ui-chart': Chart,
  },
  name: 'HighDimensional',
  data() {
    return {
      config: {
        searchText: '',
        displayWordLabel: true,
        dimension: '2',
        reduction: 'tsne',
        running: true,
      },
      embeddingData: [],
    };
  },
  created() {
    this.fetchDatasets();
  },
  watch: {
    'config.dimension': function(val) {
      this.fetchDatasets();
    },
    'config.reduction': function(val) {
      this.fetchDatasets();
    },
  },
  mounted() {
    autoAdjustHeight();
  },
  methods: {
    fetchDatasets() {
      // Fetch the data from the server. Passing dimension and reduction method
      let params = {
        dimension: this.config.dimension,
        reduction: this.config.reduction,
      };
      getHighDimensionalDatasets(params).then(({errno, data}) => {
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
