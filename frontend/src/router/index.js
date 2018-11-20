import Vue from 'vue';
import Router from 'vue-router';

import Metrics from '@/metrics/Metrics';
import Samples from '@/samples/Samples';
import Graph from '@/graph/Graph';
import HighDimensional from '@/high-dimensional/HighDimensional';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/metrics',
      name: 'Metrics',
      component: Metrics,
      props: (route) => ({
        runs: route.query.runs,
        language: route.query.language,
      }),
    },
    {
      path: '/samples',
      name: 'Samples',
      component: Samples,
      props: (route) => ({
        runs: route.query.runs,
        language: route.query.language,
      }),
    },
    {
      path: '/graphs',
      name: 'Graph',
      component: Graph,
      props: (route) => ({
        language: route.query.language,
      }),
    },
    {
      path: '/HighDimensional',
      name: 'HighDimensional',
      component: HighDimensional,
      props: (route) => ({
        runs: route.query.runs,
        language: route.query.language,
      }),
    },
  ],
});
