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

// the time to refresh chart data
const intervalTime = 30;

export default {
    components: {
        'ui-config': Config,
        'ui-chart': Chart
    },
    name: 'HighDimensional',
    props: {
        runs: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            config: {
                searchText: '',
                displayWordLabel: true,
                dimension: '2',
                reduction: 'pca',
                selectedRun: '',
                running: true
            },
            embeddingData: [],
            showLoading: false,
            isDemo: process.env.NODE_ENV === 'demo'
        };
    },
    created() {
        // Setting selectedRun should trigger fetchDatasets
        if (this.runs.length > 0) {
            this.config.selectedRun = this.runs[0];
        }

        if (this.config.running && !this.isDemo) {
            this.startInterval();
        }
    },
    beforeDestroy() {
        this.stopInterval();
    },
    watch: {
        'config.dimension': function (val) {
            this.fetchDatasets();
        },
        'config.reduction': function (val) {
            this.fetchDatasets();
        },
        'config.selectedRun': function (val) {
            this.fetchDatasets();
        },
        'config.running': function (val) {
            (val && !this.isDemo) ? this.startInterval() : this.stopInterval();
        },
        runs: function (val) {
            if (this.runs.length > 0) {
                this.config.selectedRun = this.runs[0];
            }
        }
    },
    mounted() {
        autoAdjustHeight();
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
                run: this.config.selectedRun
            };
            getHighDimensionalDatasets(params).then(({errno, data}) => {
                this.showLoading = false;

                let vectorData = data.embedding;
                let labels = data.labels;

                for ( let i = 0; i < vectorData.length; i++) {
                    vectorData[i].push(labels[i]);
                }

                this.embeddingData = vectorData;
            });
        }
    }
};

</script>

<style lang="stylus">

</style>
