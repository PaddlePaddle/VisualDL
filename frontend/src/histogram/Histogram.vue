<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-chart-page
        :config="config"
        :runs-items="runsItems"
        :tag-list="filteredTagsList"
        :title="'Tags matching ' + config.groupNameReg"
      />
      <ui-chart-page
        v-for="item in groupedTags"
        :key="item.group"
        :config="config"
        :runs-items="runsItems"
        :tag-list="item.tags"
        :title="item.group"
      />
    </div>
    <div class="visual-dl-page-right">
      <div class="visual-dl-page-config-container">
        <ui-config
          :runs-items="runsItems"
          :config="config"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {getPluginHistogramsTags, getRuns} from '../service';
import Config from './ui/Config';
import ChartPage from './ui/ChartPage';
import {flatten, uniq} from 'lodash';
import autoAdjustHeight from '../common/util/autoAdjustHeight';

export default {
  components: {
    'ui-config': Config,
    'ui-chart-page': ChartPage,
  },
  computed: {
    runsItems() {
      let runsArray = this.runsArray || [];
      return runsArray.map((item) => {
        return {
          name: item,
          value: item,
        };
      });
    },
    tagsList() {
      let tags = this.tags;

      let runs = Object.keys(tags);
      let tagsArray = runs.map((run) => Object.keys(tags[run]));
      let allUniqTags = uniq(flatten(tagsArray));

      // get the data for every chart
      return allUniqTags.map((tag) => {
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
    },
    groupedTags() {
      let tagsList = this.tagsList || [];
      // put data in group
      let groupData = {};
      tagsList.forEach((item) => {
        let group = item.group;
        if (groupData[group] === undefined) {
          groupData[group] = [];
          groupData[group].push(item);
        } else {
          groupData[group].push(item);
        }
      });

      // to array
      let groups = Object.keys(groupData);
      return groups.map((group) => {
        return {
          group,
          tags: groupData[group],
        };
      });
    },
  },
  data() {
    return {
      runsArray: [],
      tags: [],
      config: {
        groupNameReg: '.*',
        horizontal: 'step',
        chartType: 'offset',
        runs: [],
        running: true,
      },
      filteredTagsList: [],
    };
  },
  created() {
    getPluginHistogramsTags().then(({errno, data}) => {
      this.tags = data;
      // filter when inited
      let groupNameReg = this.config.groupNameReg;
      this.filterTagsList(groupNameReg);
    });
    getRuns().then(({errno, data}) => {
      this.runsArray = data;
      this.config.runs = data;
    });
  },

  mounted() {
    autoAdjustHeight();
  },
  watch: {
    'config.groupNameReg': function(val) {
      this.throttledFilterTagsList();
    },
  },
  methods: {
    filterTagsList(groupNameReg) {
      if (!groupNameReg) {
        this.filteredTagsList = [];
        return;
      }
      let tagsList = this.tagsList || [];
      let regExp = new RegExp(groupNameReg);
      let filtedTagsList = tagsList.filter((item) => regExp.test(item.tag));
      this.filteredTagsList = filtedTagsList;
    },
    throttledFilterTagsList: _.debounce(
      function() {
        this.filterTagsList(this.config.groupNameReg);
      }, 300
    ),
  },
};

</script>

<style lang="stylus">

</style>
