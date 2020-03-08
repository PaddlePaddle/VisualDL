import {exposeWorker} from 'react-hooks-worker';
import {divide, DivideParams} from '~/resource/high-dimensional';

// exposeWorker can only handle Promise
exposeWorker((data: DivideParams) => Promise.resolve(divide(data)));
