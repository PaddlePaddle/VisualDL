import {exposeWorker} from 'react-hooks-worker';
import {range, RangeParams} from '~/resource/scalars';

// exposeWorker can only handle Promise
exposeWorker((data: RangeParams) => Promise.resolve(range(data)));
