import {TransformParams, transform} from '~/resource/scalars';

import {exposeWorker} from 'react-hooks-worker';

// exposeWorker can only handle Promise
exposeWorker((data: TransformParams) => Promise.resolve(transform(data)));
