// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './App';
import Vuetify from 'vuetify';
import router from '@/router';
Vue.config.productionTip = false;

Vue.use(VueI18n);
const DEFAULT_LANG = 'zh';
const locales = {
  zh: require('./assets/language/zh.json'),
  en: require('./assets/language/en.json'),
};

const i18n = new VueI18n({
  locale: DEFAULT_LANG,
  messages: locales,
});

Vue.use(Vuetify, {
  theme: {
    primary: '#008c99',
    accent: '#008c99',
    toolbox_icon: '#999999',
    dark_primary: '#00727c',
    tag_background: '#f5f5f5',
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#root',
  router,
  i18n: i18n,
  components: {App},
  template: '<App/>',
});
