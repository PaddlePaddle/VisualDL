<template>
    <div class="visual-dl-page-config-com">
        <v-text-field
                label="Group name RegExp"
                hint="input a tag group name"
                v-model="config.groupNameReg"
                dark
        ></v-text-field>

        <div class="visual-dl-page-slider-block">
            <v-slider label="Smoothing"
                      :max="0.99"
                      :min="0"
                      :step="0.01"
                      v-model="smoothingValue"
                      class="visual-dl-page-smoothing-slider"
                      dark></v-slider>
            <span class="visual-dl-page-slider-span">{{smoothingValue}}</span>
        </div>

        <v-radio-group label="Horizontal" v-model="config.horizontal" dark>
            <v-radio label="Step" value="step"></v-radio>
            <v-radio label="Relative" value="relative"></v-radio>
            <v-radio label="Wall" value="wall"></v-radio>
        </v-radio-group>

        <v-select
                :items="sortingMethodItems"
                v-model="config.sortingMethod"
                label="Tooltip sorting method"
                class="visual-dl-page-config-selector"
                dark dense
        ></v-select>

        <v-checkbox class="visual-dl-page-config-checkbox" label="Ignore outliers in chart scaling" v-model="config.outlier" dark></v-checkbox>

        <label class="visual-dl-page-checkbox-group-label">Runs</label>

        <v-checkbox v-for="item in runsItems"
                    :key="item.name"
                    :label="item.name"
                    :value="item.value"
                    v-model="config.runs"
                    dark
                    class="visual-dl-page-runs-checkbox"
        ></v-checkbox>

        <v-btn :color="config.running ? 'primary' : 'error'"
                  v-model="config.running"
                  @click="toggleAllRuns"
                  class="visual-dl-page-run-toggle"
                  dark block
        >
            {{config.running ? 'Running' : 'Stopped'}}
        </v-btn>
    </div>
</template>
<script>

export default {
    props: {
        runsItems: Array,
        config: Object
    },
    data() {
        return {
            horizontalItems: [
                {
                    name: 'Step',
                    value: 'step'
                },
                {
                    name: 'Relative',
                    value: 'relative'
                },
                {
                    name: 'Wall',
                    value: 'wall'
                }
            ],
            sortingMethodItems: [
                'default', 'descending', 'ascending', 'nearest'
            ],
            smoothingValue: this.config.smoothing
        };
    },
    watch: {
        smoothingValue: _.debounce(
            function() {
                this.config.smoothing = this.smoothingValue;
            }, 50
        )
    },
    methods: {
        toggleAllRuns() {
            this.config.running = !this.config.running;
        }
    }
};

</script>
<style lang="stylus">
+prefix-classes('visual-dl-page-')
    .config-com
        padding 20px
        .slider-block
            display flex
            align-items center
        .smoothing-slider
            display inline
        .slider-span
            width 40px
        .run-toggle
            margin-top 20px
        .config-checkbox label
            font-size 13px
        .config-selector
            margin-top 12px
            margin-bottom 20px
        .checkbox-group-label
            display flex
            margin-top 20px
            margin-bottom 10px

</style>


