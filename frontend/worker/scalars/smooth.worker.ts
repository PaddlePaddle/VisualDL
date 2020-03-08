import {exposeWorker} from 'react-hooks-worker';
import {transform, TransformParams} from '~/resource/scalars';

// exposeWorker can only handle Promise
exposeWorker((data: TransformParams) => Promise.resolve(transform(data)));
