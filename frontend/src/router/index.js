import Vue from 'vue';
import Router from 'vue-router';

import Metrics from '@/metrics/Metrics';
import Histogram from '@/histogram/Histogram';
import Images from '@/images/Images';
import Graph from '@/graph/Graph';
import Texts from '@/texts/Texts';
import Audio from '@/audio/Audio';
import HighDimensional from '@/high-dimensional/HighDimensional';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/metrics',
      name: 'Metrics',
      component: Metrics,
      props: (route) => ({
          runs: route.query.runs
      })
    },
    {
      path: '/histograms',
      name: 'Histograms',
      component: Histogram,
      props: (route) => ({
          runs: route.query.runs
      })
    },
    {
      path: '/images',
      name: 'Images',
      component: Images,
      props: (route) => ({
          runs: route.query.runs
      })
    },
    {
      path: '/graphs',
      name: 'Graph',
      component: Graph,
    },
    {
      path: '/texts',
      name: 'Texts',
      component: Texts,
      props: (route) => ({
          runs: route.query.runs
      })
    },
    {
      path: '/audio',
      name: 'Audio',
      component: Audio,
      props: (route) => ({
          runs: route.query.runs
      })
    },
    {
      path: '/HighDimensional',
      name: 'HighDimensional',
      component: HighDimensional,
      props: (route) => ({
          runs: route.query.runs
      })
    },
  ],
});
