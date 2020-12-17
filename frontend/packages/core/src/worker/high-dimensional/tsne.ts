/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {TSNEParams, TSNEResult} from '~/resource/high-dimensional';

import {WorkerSelf} from '~/worker';
import {tSNE} from '~/resource/high-dimensional';
import type {tSNEOptions} from '~/resource/high-dimensional/tsne';

type InfoStepData = {
    type: 'step';
};
type InfoResetData = {
    type: 'reset';
};
type InfoParamsData = {
    type: 'params';
    data: Partial<Omit<tSNEOptions, 'dimension'>>;
};
export type InfoData = InfoStepData | InfoResetData | InfoParamsData;

const workerSelf = new WorkerSelf();
workerSelf.emit('INITIALIZED');
workerSelf.on<TSNEParams>('RUN', data => {
    const t_sne = new tSNE({
        dimension: data.n,
        perplexity: data.perplexity,
        epsilon: data.epsilon
    });

    const reset = () => {
        t_sne.setData(data.input, data.dim);
        return workerSelf.emit<TSNEResult>('RESULT', {
            vectors: t_sne.solution as [number, number, number][],
            step: t_sne.step
        });
    };

    reset();

    workerSelf.on<InfoData>('INFO', infoData => {
        const type = infoData.type;
        switch (type) {
            case 'step': {
                t_sne.run();
                return workerSelf.emit<TSNEResult>('RESULT', {
                    vectors: t_sne.solution as [number, number, number][],
                    step: t_sne.step
                });
            }
            case 'reset': {
                return reset();
            }
            case 'params': {
                const data = (infoData as InfoParamsData).data;
                if (data?.perplexity != null) {
                    t_sne.setPerplexity(data.perplexity);
                }
                if (data?.epsilon != null) {
                    t_sne.setEpsilon(data.epsilon);
                }
                return;
            }
            default:
                return null as never;
        }
    });
});
