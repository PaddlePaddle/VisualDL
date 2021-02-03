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

/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
    Handler,
    IWorker,
    InitializeData,
    Listeners,
    WorkerMessage,
    WorkerMessageEvent,
    WorkerMessageType
} from '~/worker/types';
import {
    callListener,
    checkWorkerModuleSupport,
    pushFunctionToListener,
    removeFunctionFromListener,
    runner
} from '~/worker/utils';

import EventEmitter from 'eventemitter3';

const BASE_URI: string = import.meta.env.SNOWPACK_PUBLIC_BASE_URI;

export default class WebWorker implements IWorker {
    private listeners: Listeners = {};
    private onceListeners: Listeners = {};
    private worker: Worker | null = null;
    private emitter: EventEmitter | null = null;
    env = import.meta.env;

    constructor(name: string) {
        const workerPath = `${BASE_URI}/_dist_/worker`;

        if (checkWorkerModuleSupport()) {
            this.worker = new Worker(`${workerPath}/worker.js`, {type: 'module'});
            this.worker.addEventListener('message', this.listener.bind(this));
            this.emit<InitializeData>('INITIALIZE', {name, env: import.meta.env});
        } else {
            this.emitter = new EventEmitter();
            this.emitter.addListener('message', this.listener.bind(this));
            window.setTimeout(() => {
                runner(name, this);
            }, 200);
        }
    }

    private listener<T>(e: WorkerMessageEvent<T>) {
        callListener.call(this, this.onceListeners, e.data);
        callListener.call(this, this.listeners, e.data);
        delete this.onceListeners[e.data.type];
    }

    emit<T>(type: WorkerMessageType<T>, data?: T) {
        if (this.worker) {
            this.worker.postMessage({
                type,
                data
            } as WorkerMessage<T>);
        } else if (this.emitter) {
            this.emitter.emit('message', {data: {type, data}});
        }
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

    terminate() {
        if (this.worker) {
            this.worker.terminate();
        }
    }
}
