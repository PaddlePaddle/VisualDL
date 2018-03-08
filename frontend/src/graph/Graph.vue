<template>
    <div class="visual-dl-page-container">
        <div class="visual-dl-page-left">
            <ui-chart
                :fitScreen="fitScreen"
                :download="download"
                :scale="config.scale"
            ></ui-chart>
        </div>
        <div class="visual-dl-page-right">
            <div class="visual-dl-page-config-container">
                <ui-config
                    :config="config"
                    @fitScreen="handleFitScreen"
                    @download="handleDownload"
                ></ui-config>
            </div>
        </div>
    </div>
</template>

<script>
import autoAdjustHeight from '../common/util/autoAdjustHeight';
import Config from './ui/Config'
import Chart from './ui/Chart';

export default {
    components: {
        'ui-config': Config,
        'ui-chart': Chart
    },
    name: 'Graph',
    data () {
        return {
            config: {
                scale: 0.5
            },
            fitScreen: {fitScreen: false},
            download: {download: false}
        }
    },
    mounted() {
        autoAdjustHeight();
    },
    methods: {
        handleFitScreen() {
            this.fitScreen = {fitScreen: true}
            this.config.scale = 0.5;
        },
        handleDownload() {
            this.download = {fitScreen: true}
        }
    }
};

</script>

<style lang="stylus">

</style>
