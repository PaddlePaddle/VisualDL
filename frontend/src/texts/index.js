import {router} from 'san-router';

import Texts from './Texts';

router.add({
  target: '#content',
  rule: '/texts',
  Component: Texts,
});
