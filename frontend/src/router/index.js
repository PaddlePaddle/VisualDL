import Vue from 'vue'
import Router from 'vue-router'

import Scalars from '@/scalars/Scalars'
import Histogram from '@/histogram/Histogram'
import Images from '@/images/Images'
import Graph from '@/graph/Graph'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/scalars',
      name: 'Scalars',
      component: Scalars
    },
    {
      path: '/histograms',
      name: 'Histograms',
      component: Histogram
    },
    {
      path: '/images',
      name: 'Images',
      component: Images
    },
    {
      path: '/graphs',
      name: 'Graph',
      component: Graph
    },
  ]
})
