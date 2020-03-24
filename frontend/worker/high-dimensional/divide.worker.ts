import {DivideParams, divide} from '~/resource/high-dimensional';

import {exposeWorker} from 'react-hooks-worker';

// exposeWorker can only handle Promise
exposeWorker((data: DivideParams) => Promise.resolve(divide(data)));
