<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">

      <div>
        <v-card
          hover
          color="tag_background"
          class="visual-dl-tags-tab">
          <v-icon>search</v-icon>
          <input type="search" v-model="config.groupNameReg"
             autocomplete="false"
             placeholder="Search tags in RegExp"
             class="visual-dl-tags-search-input">
        </v-card>

        <ui-tags-tab
          :total="tagsListCount(allTagsMatchingList)"
          :title="config.groupNameReg.trim().length == 0 ? 'All' : config.groupNameReg"
          :active="selectedGroup === '' "
          @click="selectedGroup = '' "
        />
        <ui-tags-tab
          v-for="item in groupedTags"
          :total="tagsListCount(item.tags)"
          :title="item.group"
          :active="item.group === selectedGroup"
          @click="selectedGroup = item.group"
        />
      </div>

      <ui-chart-page
        :config="config"
        :tag-list="finalTagsList"
        :total="tagsListCount(finalTagsList)"
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
import {getPluginScalarsTags, getPluginHistogramsTags} from '../service';
import {cloneDeep, flatten, uniq} from 'lodash';
import autoAdjustHeight from '../common/util/autoAdjustHeight';

import TagsTab from '../common/component/TagsTab';
import Config from './ui/Config';
import ChartPage from './ui/ChartPage';

export default {
  components: {
    'ui-config': Config,
    'ui-chart-page': ChartPage,
    'ui-tags-tab': TagsTab,
  },
  props: {
    runs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      tagInfo: {scalar: {}, histogram: {}},
      config: {
        groupNameReg: '',
        // scalar 'enabled' will be false when no scalar logs available, 'display' is toggled by user in config
        scalar: {enabled: false, display: false},
        histogram: {enabled: false, display: false},
        smoothing: 0.6,
        horizontal: 'step',
        sortingMethod: 'default',
        outlier: false,
        runs: [],
        running: true,
        chartType: 'offset',
      },
      filteredTagsList: {scalar: [], histogram: []},
      selectedGroup: '',
    };
  },
  computed: {
    finalTagsList() {
      if (this.selectedGroup === '') {
        return this.allTagsMatchingList;
      } else {
        let list;
        this.groupedTags.forEach((item) => {
          if (item.group === this.selectedGroup) {
            list = item.tags;
          }
        });
        return list;
      }
    },
    allTagsMatchingList() {
      let list = cloneDeep(this.filteredTagsList);
      list.scalar = this.filteredListByRunsForScalar(list.scalar);
      list.histogram = this.filteredListByRunsForHistogram(list.histogram);
      return list;
    },
    tagsList() {
      let list = {};

      Object.keys(this.tagInfo).forEach((type) => {
        let tags = this.tagInfo[type];

        let runs = Object.keys(tags);
        let tagsArray = runs.map((run) => Object.keys(tags[run]));
        let allUniqTags = uniq(flatten(tagsArray));

        // get the data for every chart
        let tagsForEachType = allUniqTags.map((tag) => {
          let tagList = runs.map((run) => {
            return {
              run,
              tag: tags[run][tag],
            };
          }).filter((item) => item.tag !== undefined);
          return {
            tagList,
            tag,
            group: tag.split('/')[0],
          };
        });
        list[type] = tagsForEachType;
      });
      return list;
    },
    groupedTags() {
      let tagsList = this.tagsList || [];

      // put data in group
      let groupData = {};

      Object.keys(tagsList).forEach((type) => {
        let tagsForEachType = tagsList[type];

        tagsForEachType.forEach((item) => {
          let group = item.group;

          if (groupData[group] === undefined) {
            groupData[group] = {};
          }
          if (groupData[group][type] === undefined) {
            groupData[group][type] = [];
          }

          groupData[group][type].push(item);
        });
      });

      // to array
      let groups = Object.keys(groupData);
      let groupList = groups.map((group) => {
        groupData[group].scalar = this.filteredListByRunsForScalar(groupData[group].scalar);
        groupData[group].histogram = this.filteredListByRunsForHistogram(groupData[group].histogram);

        return {
          group,
          tags: groupData[group],
        };
      });

      return groupList;
    },
  },
  created() {
    getPluginScalarsTags().then(({errno, data}) => {
      if (!data) return;

      this.tagInfo.scalar = data;
      this.config.scalar.enabled = true;
      this.config.scalar.display = true;
      this.filterTagsList(this.config.groupNameReg);
    });

    getPluginHistogramsTags().then(({errno, data}) => {
      if (!data) return;

      this.tagInfo.histogram = data;
      this.config.histogram.enabled = true;
      this.config.histogram.display = true;
      this.filterTagsList(this.config.groupNameReg);
    });

    this.config.runs = this.runs;
  },
  mounted() {
    autoAdjustHeight();
  },
  watch: {
    'config.groupNameReg': function(val) {
      this.throttledFilterTagsList();
    },
    'runs': function(val) {
      this.config.runs = val;
    },
  },
  methods: {
    filterTagsList(groupNameReg) {
      if (!groupNameReg || groupNameReg.trim().length == 0) {
        this.filteredTagsList = cloneDeep(this.tagsList);
        return;
      }
      this.selectedGroup = '';
      let tagsList = this.tagsList || {};
      let regExp = new RegExp(groupNameReg);
      Object.keys(tagsList).forEach((type) => {
        let tagsForEachType = tagsList[type];

        this.filteredTagsList[type] = tagsForEachType.filter((item) => regExp.test(item.tag));
      });
    },
    throttledFilterTagsList: _.debounce(
      function() {
        this.filterTagsList(this.config.groupNameReg);
      }, 300
    ),
    filteredListByRunsForScalar(scalar) {
      if (!this.config.scalar.display) return [];
      let runs = this.config.runs || [];
      let list = cloneDeep(scalar) || [];
      list = list.map((item) => {
        item.tagList = item.tagList.filter((one) => runs.includes(one.run));
        return item;
      });
      return list.filter((item) => item.tagList.length > 0);
    },
    filteredListByRunsForHistogram(histogram) {
      if (!this.config.histogram.display) return [];
      let runs = this.config.runs || [];
      let list = cloneDeep(histogram) || [];
      return flatten(list.map((item) => {
        return item.tagList.filter((one) => runs.includes(one.run));
      }));
    },
    tagsListCount(tagsList) {
      let count = 0;
      if (tagsList.scalar !== undefined) count += tagsList.scalar.length;
      if (tagsList.histogram !== undefined) count += tagsList.histogram.length;
      return count;
    },
  },
};

</script>

<style lang="stylus">

</style>
