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

import type {
    Handler,
    IWorker,
    InitializeData,
    Listeners,
    WorkerMessage,
    WorkerMessageEvent,
    WorkerMessageType
} from '~/worker/types';
import {callListener, pushFunctionToListener, removeFunctionFromListener, runner} from '~/worker/utils';

class WorkerSelf implements IWorker {
    private listeners: Listeners = {};
    private onceListeners: Listeners = {};
    env = {};

    constructor() {
        self.addEventListener('message', this.listener.bind(this));
    }

    private listener<T>(e: WorkerMessageEvent<T>) {
        callListener.call(this, this.onceListeners, e.data);
        callListener.call(this, this.listeners, e.data);
        delete this.onceListeners[e.data.type];
    }

    emit<T>(type: WorkerMessageType<T>, data?: T) {
        self.postMessage({
            type,
            data
        } as WorkerMessage<T>);
    }

    on<T>(type: WorkerMessageType<T>, handler: Handler<T>) {
        pushFunctionToListener(this.listeners, type, handler);
    }

    off<T>(type: WorkerMessageType<T>, handler?: Handler<T>) {
        removeFunctionFromListener(this.listeners, type, handler);
        removeFunctionFromListener(this.onceListeners, type, handler);
    }

    once<T>(type: WorkerMessageType<T>, handler: Handler<T>) {
        pushFunctionToListener(this.onceListeners, type, handler);
    }
}

const worker = new WorkerSelf();

worker.once<InitializeData>('INITIALIZE', ({name, env}) => {
    worker.env = env;
    runner(name, worker);
});
