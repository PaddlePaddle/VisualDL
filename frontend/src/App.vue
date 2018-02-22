<template>
    <div id="app">
        <v-app>
            <AppMenu :initialRoute="initialRoute">
            </AppMenu>
            <router-view></router-view>
        </v-app>
    </div>
</template>

<script>
import AppMenu from './common/component/AppMenu'

export default {
    name: 'App',
    components: {
		AppMenu
    },
    data() {
        return {
            initialRoute: "scalars"
        }
    },
    created() {
        if (location.hash && location.hash != '#/') {
            this.initialRoute = /(\#\/)(\w*)([?|&]{0,1})/.exec(location.hash)[2];
        }
        else {
            location.hash = '#/scalars';
        }
    }
}
</script>

<style lang="stylus">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

@import './style/variables';
+prefix-classes('visual-dl-page-')
    .container
        padding-right 250px
        position relative
        background $-left-background-color
        .left
            width 100%
            overflow scroll
            border solid 1px $-left-border-clor
            background $-left-border-clor
            min-height 300px
            padding 2%
            box-sizing border-box
        .right
            overflow scroll
            width 250px
            min-height 300px
            position absolute
            right 0
            top 0
            box-sizing border-box
            .config-com
                color $-right-font-color

</style>

