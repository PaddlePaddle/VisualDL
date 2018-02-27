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
                      :max="0.999"
                      :min="0"
                      :step="0.001"
                      v-model="config.smoothing"
                      class="visual-dl-page-smoothing-slider"
                      dark></v-slider>
            <span>{{config.smoothing}}</span>
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
                dark
        ></v-select>

        <v-checkbox label="Show data download links" v-model="config.downloadLink" dark></v-checkbox>
        <v-checkbox label="Ignore outliers in chart scaling" v-model="config.outlier" dark></v-checkbox>

        <label>Runs</label>

        <v-checkbox v-for="item in runsItems"
                    :key="item.name"
                    :label="item.name"
                    :value="item.value"
                    v-model="config.runs"
                    dark
                    class="visual-dl-page-config-checkbox"
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
import('vuetify/dist/vuetify.min.css')

//import TextField from 'san-mui/TextField';

// TODO: Consider create Vue Components for these

//import Slider from '../../common/component/Slider';
//import RadioGroup from '../../common/component/RadioGroup';
//import DropDownMenu from '../../common/component/DropDownMenu';
//import CheckBoxGroup from '../../common/component/CheckBoxGroup';
//import Button from 'san-mui/Button';

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
            ]
        };
    },
    methods: {
        toggleAllRuns() {
            this.config.running = !this.config.running;
        }
    }
};

</script>
<style lang="stylus">
@import '../../style/variables';

+prefix-classes('visual-dl-page-')
    .config-com
        padding 20px
        .slider-block
            display flex
            align-items center
        .smoothing-slider
            display inline
        .run-toggle
            margin-top 20px

</style>


