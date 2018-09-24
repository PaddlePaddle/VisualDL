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

      <ui-sample-page
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

import {getPluginImagesTags, getPluginAudioTags, getPluginTextsTags} from '../service';
import {cloneDeep, flatten, uniq} from 'lodash';
import autoAdjustHeight from '../common/util/autoAdjustHeight';

import TagsTab from '../common/component/TagsTab';
import Config from './ui/Config';
import SamplePage from './ui/SamplePage';

export default {
  name: 'Samples',
  components: {
    'ui-config': Config,
    'ui-sample-page': SamplePage,
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
      tagInfo: { image: {}, audio: {}, text: {} },
      config: {
        groupNameReg: '',
        image: { enabled: false, display: false },
        audio: { enabled: false, display: false },
        text: { enabled: false, display: false },
        isActualImageSize: false,
        runs: [],
        running: true,
      },
      filteredTagsList: { image: {}, audio: {}, text: {} },
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
      this.filteredListByRuns(list);
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
        this.filteredListByRuns(groupData[group]);

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
      if (!groupNameReg || groupNameReg.trim().length == 0) {
        this.filteredTagsList = cloneDeep(this.tagsList);
        return;
      }
      this.selectedGroup = '';
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
    filteredListByRuns(list) {
      list.image = !this.config.image.display ? [] : this.filteredTypeByRuns(list.image);
      list.audio = !this.config.audio.display ? [] : this.filteredTypeByRuns(list.audio);
      list.text = !this.config.text.display ? [] : this.filteredTypeByRuns(list.text);
    },
    filteredTypeByRuns(tagList) {
      let runs = this.config.runs || [];
      let list = cloneDeep(tagList) || [];
      return flatten(list.map((item) => {
        return item.tagList.filter((one) => runs.includes(one.run));
      }));
    },
    tagsListCount(tagsList) {
      let count = 0;
      if (tagsList.image !== undefined) count += tagsList.image.length;
      if (tagsList.audio !== undefined) count += tagsList.audio.length;
      if (tagsList.text !== undefined) count += tagsList.text.length;
      return count;
    },
  },
};

</script>

<style lang="stylus">

</style>
