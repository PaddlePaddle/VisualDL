import {RangeParams, range} from '~/resource/scalars';

import {exposeWorker} from 'react-hooks-worker';

// exposeWorker can only handle Promise
exposeWorker((data: RangeParams) => Promise.resolve(range(data)));
