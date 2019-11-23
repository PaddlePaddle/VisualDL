<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-chart-page
        :config="config"
        :tag-list="filteredTagsList"
        :title="'Tags matching' + config.groupNameReg"
      />
      <ui-chart-page
        v-for="item in groupedTags"
        :key="item.group"
        :config="config"
        :tag-list="item.tags"
        :title="item.group"
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
import {getPluginScalarsTags} from '../service';
import {flatten, uniq} from 'lodash';
import autoAdjustHeight from '../common/util/autoAdjustHeight';

import Config from './ui/Config';
import ChartPage from './ui/ChartPage';

export default {
    components: {
        'ui-config': Config,
        'ui-chart-page': ChartPage
    },
    props: {
        runs: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            tags: [],
            config: {
                groupNameReg: '.*',
                smoothing: 0.6,
                horizontal: 'step',
                sortingMethod: 'default',
                outlier: false,
                runs: [],
                running: true
            },
            filteredTagsList: []
        };
    },
    computed: {
        tagsList() {
            let tags = this.tags;

            let runs = Object.keys(tags);
            let tagsArray = runs.map(run => Object.keys(tags[run]));
            let allUniqTags = uniq(flatten(tagsArray));

            // get the data for every chart
            return allUniqTags.map(tag => {
                let tagList = runs.map(run => {
                    return {
                        run,
                        tag: tags[run][tag]
                    };
                }).filter(item => item.tag !== undefined);
                return {
                    tagList,
                    tag,
                    group: tag.split('/')[0]
                };
            });
        },
        groupedTags() {
            let tagsList = this.tagsList || [];
            // put data in group
            let groupData = {};
            tagsList.forEach(item => {
                let group = item.group;
                if (groupData[group] === undefined) {
                    groupData[group] = [];
                    groupData[group].push(item);
                }
                else {
                    groupData[group].push(item);
                }
            });

            // to array
            let groups = Object.keys(groupData);
            return groups.map(group => {
                return {
                    group,
                    tags: groupData[group]
                };
            });
        }
    },
    created() {
        getPluginScalarsTags().then(({errno, data}) => {
            this.tags = data;

            // filter when inited
            let groupNameReg = this.config.groupNameReg;
            this.filterTagsList(groupNameReg);
        });
        this.config.runs = this.runs;
    },
    mounted() {
        autoAdjustHeight();
    },
    watch: {
        'config.groupNameReg': function (val) {
            this.throttledFilterTagsList();
        },
        runs: function (val) {
            this.config.runs = val;
        }
    },
    methods: {
        filterTagsList(groupNameReg) {
            if (!groupNameReg) {
                this.filteredTagsList = [];
                return;
            }
            let tagsList = this.tagsList || [];
            let regExp = new RegExp(groupNameReg);
            this.filteredTagsList = tagsList.filter(item => regExp.test(item.tag));
        },
        throttledFilterTagsList: _.debounce(
            function () {
                this.filterTagsList(this.config.groupNameReg);
            }, 300
        )
    }
};

</script>

<style lang="stylus">

</style>
