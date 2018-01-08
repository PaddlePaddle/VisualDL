import {router} from 'san-router';

import Histogram from './Histogram';

router.add({
    target: '#content',
    rule: '/histograms',
    Component: Histogram
});
