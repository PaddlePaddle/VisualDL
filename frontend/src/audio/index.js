import {router} from 'san-router';

import Audio from './Audio';

router.add({
  target: '#content',
  rule: '/audio',
  Component: Audio,
});
