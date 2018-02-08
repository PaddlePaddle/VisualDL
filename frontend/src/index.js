//import 'normalize.css/normalize.css';
//import 'san-mui/index.css';
//import './common/component/ui-common.styl';
//
//import './home/index';
//import './scalars/index';
//import './images/index';
//import './histogram/index';
//import './graph/index';
//
//import App from './App';
//new App({
//    data: {
//        titleName: 'VisualDL'
//    }
//}).attach(document.getElementById('root'));
//
//var vm = new Vue({
//    el: "#root",
//
//})



// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import AppMenu from '@/common/component/AppMenu'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#root',
  components: { App },
  template: '<App/>',
})
