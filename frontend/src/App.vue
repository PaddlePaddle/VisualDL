<template>
  <div id="app">
    <v-app>
      <AppMenu :initial-route="initialRoute"/>
      <router-view/>
    </v-app>
  </div>
</template>

<script>
import AppMenu from './common/component/AppMenu';

export default {
  name: 'App',
  components: {
    AppMenu,
  },
  data() {
    return {
      initialRoute: 'scalars',
    };
  },
  created() {
    if (location.hash && location.hash != '#/') {
      this.initialRoute = /(\#\/)(\w*)([?|&]{0,1})/.exec(location.hash)[2];
    } else {
      location.hash = '#/scalars';
    }
  },
};
</script>

<style lang="stylus">
@import '~style/variables';
@import '../style/main';
@import url('https://fonts.googleapis.com/css?family=Merriweather+Sans:400,700');

#app {
  font-family: 'Merriweather Sans', Helvetica, Arial, sans-serif;
  font-weight: regular;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $-content-text-color;
}

+prefix-classes('visual-dl-page-')
    .container
        padding-right 300px
        position relative
        background $-left-background-color
        .left
            width 100%
            overflow scroll
            border solid 1px $-left-border-color
            background $-left-border-color
            min-height 300px
            padding 2% 0% 2% 2%
            box-sizing border-box
        .right
            overflow scroll
            width 300px
            min-height 300px
            position absolute
            right 0
            top 0
            box-sizing border-box
            font-size 14px
            font-weight normal
            .config-com
                color $-right-font-color

</style>

