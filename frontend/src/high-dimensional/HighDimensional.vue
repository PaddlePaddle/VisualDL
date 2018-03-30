<template>
    <div class="visual-dl-page-container">
        <div class="visual-dl-page-left">
            <ui-chart
                    :config="config"
                    :displayWordLabel="config.displayWordLabel"
                    :searchText="config.searchText"
            ></ui-chart>
             <!--<ui-chart-page-->
                    <!--:config="config"-->
                    <!--:runsItems="runsItems"-->
                    <!--:tagList="filteredTagsList"-->
                    <!--:title="'Tags matching' + config.groupNameReg"-->
            <!--&gt;</ui-chart-page>-->
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
import {getHighDimensionalDatasets, getTensors} from '../service';
import autoAdjustHeight from '../common/util/autoAdjustHeight';
import Config from './ui/Config'
import Chart from './ui/Chart';
import ChartPage from './ui/ChartPage';

export default {
    components: {
        'ui-config': Config,
        'ui-chart': Chart,
        'ui-chart-page': ChartPage
    },
    name: 'HighDimensional',
    data () {
        return {
            config: {
                searchText: '',
                displayWordLabel: false
            },
            fitScreen: {fitScreen: false},
            download: {download: false}
        }
    },
    mounted() {
        autoAdjustHeight();
    },
    methods: {
    }
};

</script>

<style lang="stylus">

</style>
