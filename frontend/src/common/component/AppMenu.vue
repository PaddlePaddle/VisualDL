<template>
  <div>
    <div class="visual-dl-app-menu">
      <v-toolbar
        color="primary"
        dark>
        <v-toolbar-title class="appbar-menu-title"/>

        <v-toolbar-items>
        <v-menu
          open-on-hover
          offset-y
          :close-on-content-click="false">
          <v-btn
            slot="activator"
            depressed
            @mouseover="runsSelectorOpen = true"
            @mouseout="runsSelectorOpen = false"
            :ripple="false"
            :color="runsSelectorOpen ? 'dark_primary' : 'primary'"
            :class="runsSelectorOpen ? 'runs-selected-menu-open' : 'runs-selected-menu'"
            > <span class="runs-selected-text">Runs: {{ runs.length == 0 ? 'None selected' : runs.join(', ') }} </span>
            <v-icon>arrow_drop_down</v-icon>
          </v-btn>
          <v-list dense>
            <v-list-tile
              v-for="(item, index) in availableRuns"
              :key="index"
              @mouseover="runsSelectorOpen = true"
              @mouseout="runsSelectorOpen = false">
              <v-list-tile-action>
                <v-checkbox
                  :value="item"
                  :key="item"
                  :label="item"
                  v-model="runs" />
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-menu>

          <v-btn
            v-for="item in items"
            :key="item.name"
            flat
            dark
            :class="selected.toLowerCase() === item.name.toLowerCase() ? 'menu-item-selected': 'menu-item'"
            @click="handleItemClick(item)"
          >{{ item.title }}</v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </div>
  </div>
</template>

<script>
import {getRuns} from '../../service';

export default {
  props: {
    initialRoute: {
      type: String,
      required: true,
    },
  },
  name: 'AppMenu',
  data() {
    return {
      runsSelectorOpen: false,
      availableRuns: [],
      runs: [],
      selected: this.initialRoute,
      items: [
        {
          url: '/scalars',
          title: 'SCALARS',
          name: 'scalars',
        },
        {
          url: '/histograms',
          title: 'HISTOGRAMS',
          name: 'histograms',
        },
        {
          url: '/images',
          title: 'IMAGES',
          name: 'images',
        },
        {
          url: '/audio',
          title: 'AUDIO',
          name: 'audio',
        },
        {
          url: '/texts',
          title: 'TEXTS',
          name: 'texts',
        },
        {
          url: '/graphs',
          title: 'GRAPHS',
          name: 'graphs',
        },
        {
          url: '/HighDimensional',
          title: 'HighDimensional',
          name: 'HighDimensional',
        },
      ],
    };
  },
  created() {
    getRuns().then(({errno, data}) => {
      this.availableRuns = data;
      this.runs = data;
      //use replace here instead of push so that user cannot go back to empty run state
      this.$router.replace( { path: this.initialRoute, query: { runs: this.runs }});
    });
  },
  watch: {
    runs: function(val) {
        this.$router.push( {query: { runs: this.runs }});
    },
    '$route' (to, from) { //this will get called when back button is hit that changes path or query
       this.runs = this.$route.query.runs;
       this.selected = this.$route.name;
    }
  },
  methods: {
    handleItemClick: function(item) {
      this.selected = item.name;
      this.$router.push( { path: item.url, query: { runs: this.runs }});
    },
  },
};
</script>

<style lang="stylus">
@import '~style/variables';

.visual-dl-app-menu
    .appbar-menu-title
        flex none
        margin-right 10px
        background url('../../assets/ic_logo.svg') no-repeat
        width 180px
        height 24px

    .menu-item
        font-size 16px
        background none
        padding 0 10px
        color #fff
        opacity 0.6
        display flex
        flex-direction row
        font-weight bold

    .menu-item:hover
        opacity 1

    .menu-item-selected
        @extends .visual-dl-app-menu .menu-item
        opacity 1

    .runs-selected-menu
        font-size 16px
        text-transform none
        opacity 0.75

    .runs-selected-menu-open
        @extends .visual-dl-app-menu .runs-selected-menu
        opacity 1

    .runs-selected-text
        text-align left
        padding-right 6px
        overflow hidden
        text-overflow ellipsis
        max-width 200px

.theme--light .input-group:not(.input-group--error) label
    color #000

.input-group label
    overflow visible



</style>
