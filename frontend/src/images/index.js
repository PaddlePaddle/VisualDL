import {router} from 'san-router';

import Images from './Images';

router.add({
    target: '#content',
    rule: '/images',
    Component: Images
});
