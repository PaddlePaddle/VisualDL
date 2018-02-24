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
import Vuetify from 'vuetify'
import('vuetify/dist/vuetify.min.css')
import router from '@/router'
Vue.config.productionTip = false

Vue.use(Vuetify, {
    theme: {
        primary: '#008c99',
        accent: '#008c99'
    }
})

/* eslint-disable no-new */
new Vue({
    el: '#root',
    router,
    components: {App},
    template: '<App/>',
})
