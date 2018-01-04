import {router} from 'san-router';

import Scalar from './Scalars';

router.add({
    target: '#content',
    rule: '/',
    Component: Scalar
});

router.add({
    target: '#content',
    rule: '/scalars',
    Component: Scalar
});


