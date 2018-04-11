import Vue from 'vue';
import Router from 'vue-router';

import Scalars from '@/scalars/Scalars';
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
      path: '/scalars',
      name: 'Scalars',
      component: Scalars,
    },
    {
      path: '/histograms',
      name: 'Histograms',
      component: Histogram,
    },
    {
      path: '/images',
      name: 'Images',
      component: Images,
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
    },
    {
      path: '/audio',
      name: 'Audio',
      component: Audio,
    },
    {
      path: '/HighDimensional',
      name: 'HighDimensional',
      component: HighDimensional,
    },
  ],
});
