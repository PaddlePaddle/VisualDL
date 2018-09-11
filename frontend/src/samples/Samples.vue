<template>
  <div class="visual-dl-page-container">
    <div class="visual-dl-page-left">
      <ui-sample-page
        :config="config"
        :tag-list="filteredTagsList"
        :title="'Tags matching ' + config.groupNameReg"
      />
      <ui-sample-page
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

import {getPluginImagesTags, getPluginAudioTags, getPluginTextsTags} from '../service';
import {flatten, uniq} from 'lodash';
import autoAdjustHeight from '../common/util/autoAdjustHeight';

import Config from './ui/Config';
import SamplePage from './ui/SamplePage';

export default {
  name: 'Samples',
  components: {
    'ui-config': Config,
    'ui-sample-page': SamplePage,
  },
  props: {
      runs: {
        type: Array,
        required: true,
      },
  },
  data() {
    return {
      tagInfo: { image: {}, audio: {}, text: {} },
      config: {
        groupNameReg: '.*',
        image: { enabled: false, display: false },
        audio: { enabled: false, display: false },
        text: { enabled: false, display: false },
        isActualImageSize: false,
        runs: [],
        running: true,
      },
      filteredTagsList: { image: {}, audio: {}, text: {} },
    };
  },
  computed: {
    tagsList() {

      var list = {};

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
            groupData[group] = {}
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
        return {
          group,
          tags: groupData[group],
        };
      });

      return groupList;
    },
  },
  created() {
    getPluginImagesTags().then(({errno, data}) => {
      if (!data) return;

      this.tagInfo.image = data;
      this.config.image.enabled = true;
      this.config.image.display = true;
      this.filterTagsList(this.config.groupNameReg);
    });

    getPluginAudioTags().then(({errno, data}) => {
      if (!data) return;

      this.tagInfo.audio = data;
      this.config.audio.enabled = true;
      this.config.audio.display = true;
      this.filterTagsList(this.config.groupNameReg);
    });

    getPluginTextsTags().then(({errno, data}) => {
      if (!data) return;

      this.tagInfo.text = data;
      this.config.text.enabled = true;
      this.config.text.display = true;
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
    runs: function(val) {
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
  },
};

</script>

<style lang="stylus">

</style>
