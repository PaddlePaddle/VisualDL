import {router} from 'san-router';

import Graph from './Graph';

router.add({
  target: '#content',
  rule: '/graphs',
  Component: Graph,
});
