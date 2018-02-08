<template>
    <div id="app">
        <AppMenu>
        </AppMenu>

        <router-view></router-view>
    </div>

</template>

<script>
import AppMenu from './common/component/AppMenu'

export default {
  name: 'App',
  components: {
		AppMenu
    }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

