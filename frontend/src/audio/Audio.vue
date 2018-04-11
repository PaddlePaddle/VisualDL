<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-audio-container
        :expand="true"
        :config="filteredConfig"
        :runs-items="runsItems"
        :tag-list="filteredTagsList"
        :title="'Tags matching ' + config.groupNameReg"
      />
      <ui-audio-container
        v-for="item in groupedTags"
        :key="item.group"
        :config="filteredConfig"
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

import {getPluginAudioTags, getRuns} from '../service';
import {flatten, uniq} from 'lodash';
import autoAdjustHeight from '../common/util/autoAdjustHeight';

import Config from './ui/Config';
import AudioPanelContainer from './ui/AudioPanelContainer';

export default {
  name: 'Images',
  components: {
    'ui-config': Config,
    'ui-audio-container': AudioPanelContainer,
  },
  data() {
    return {
      runsArray: [],
      tags: [],
      config: {
        groupNameReg: '.*',
        isActualImageSize: false,
        runs: [],
        running: true,
      },
      filteredTagsList: [],
    };
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
    filteredConfig() {
      let config = this.config || {};
      let filteredConfig = {};
      Object.keys(config).forEach((key) => {
        let val = config[key];
        filteredConfig[key] = val;
      });
      return filteredConfig;
    },
  },
  created() {
    getPluginAudioTags().then(({errno, data}) => {
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
      this.filteredTagsList = tagsList.filter((item) => regExp.test(item.tag));
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
