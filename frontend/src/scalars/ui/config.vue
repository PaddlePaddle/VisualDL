<template>
    <div class="visual-dl-page-config-com">
        <v-text-field
                name="Group name RegExp"
                label="Group name RegExp"
                hint="input a tag group name"
                id="testing"
                v-model="config.groupNameReg"
                dark
        ></v-text-field>

        <v-slider label="Smoothing" v-bind:max="100" v-bind:min="0" v-model="config.smoothing" dark></v-slider>
        <v-text-field v-model="config.smoothing" type="number" dark></v-text-field>

        <p>{{ config.horizontal || 'null' }}</p>
        <v-radio-group v-model="config.horizontal" dark>
            <v-radio label="Step" value="step"></v-radio>
            <v-radio label="Relative" value="relative"></v-radio>
            <v-radio label="Wall" value="wall"></v-radio>
        </v-radio-group>

        <v-select
                v-bind:items="sortingMethodItems"
                v-model="config.sortingMethod"
                label="Tooltip sorting method"
                single-line
                bottom
                dark
        ></v-select>

        <v-checkbox label="Show data download links" v-model="config.downloadLink" dark></v-checkbox>
        <v-checkbox label="Ignore outliers in chart scaling" v-model="config.outlier" dark></v-checkbox>

        <p>
            RunItems{{ config.runs }}
        </p>
        <v-checkbox v-for="item in runsItems"
                    :label="item"
                    :value="item"
                    v-model="config.runs"
                    dark
        ></v-checkbox>

        <v-switch class="visual-dl-page-run-toggle"
                  v-bind:label="`Running: ${config.running.toString()}`"
                  v-model="config.running"
                  dark></v-switch>
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
    name: 'config',
    props: ['runsItems', 'config'],
    data() {
        return {
            config: {
                groupNameReg: '.*',
                smoothing: '0.6',
                horizontal: 'step',
                sortingMethod: 'default',
                downloadLink: [],
                outlier: [],
                running: true,
                runs: []
            },
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
            runsItems: [],
        };
    },
    toggleAllRuns() {
        let running = this.data.get('config.running');
        this.data.set('config.running', !running);
        this.fire('runningChange', running);
    }
};

</script>
<style lang="stylus">
@import '../../style/variables';

+prefix-classes('visual-dl-page-')
    .config-com
        width 90%
        margin 20px auto
        .run-toggle
            width 100%
            margin-top 20px

</style>


