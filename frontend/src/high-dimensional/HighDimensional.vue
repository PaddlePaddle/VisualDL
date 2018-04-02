<template>
    <div class="visual-dl-page-container">
        <div class="visual-dl-page-left">
            <ui-chart
                    :config="config"
                    :displayWordLabel="config.displayWordLabel"
                    :searchText="config.searchText"
                    :dimension="config.dimension"
                    :embedding_data="embedding_data"
            ></ui-chart>
        </div>
        <div class="visual-dl-page-right">
            <div class="visual-dl-page-config-container">
                <ui-config
                    :config="config"
                ></ui-config>
            </div>
        </div>
    </div>
</template>

<script>
import {getHighDimensionalDatasets} from '../service';
import autoAdjustHeight from '../common/util/autoAdjustHeight';
import Config from './ui/Config'
import Chart from './ui/Chart';

export default {
    components: {
        'ui-config': Config,
        'ui-chart': Chart,
    },
    name: 'HighDimensional',
    data () {
        return {
            config: {
                searchText: '',
                displayWordLabel: true,
                dimension: "2",
                reduction: "tsne",
                running: true
            },
            embedding_data: []
        }
    },
    created() {
        this.fetchDatasets()
    },
    watch: {
        'config.dimension': function(val) {
            this.fetchDatasets()
        },
        'config.reduction': function(val) {
            this.fetchDatasets()
        }
    },
    mounted() {
        autoAdjustHeight();
    },
    methods: {
        fetchDatasets() {
            // Fetch the data from the server. Passing dimension and reduction method
            let params = {
                dimension: this.config.dimension,
                reduction: this.config.reduction
            };
            getHighDimensionalDatasets(params).then(({errno, data}) => {
                var vector_data = data.embedding;
                var labels = data.labels;

                for ( var i = 0; i < vector_data.length; i ++) {
                  vector_data[i].push(labels[i])
                }

                this.embedding_data = vector_data
            });
        },
    }
};

</script>

<style lang="stylus">

</style>
