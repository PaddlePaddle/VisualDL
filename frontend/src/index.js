// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import Vuetify from 'vuetify';
import router from '@/router';
Vue.config.productionTip = false;

Vue.use(Vuetify, {
  theme: {
    primary: '#008c99',
    accent: '#008c99',
    toolbox_icon: '#999999',
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  components: {App},
  template: '<App/>',
});
