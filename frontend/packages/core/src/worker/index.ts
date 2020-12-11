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
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {WorkerMessage, WorkerMessageEvent} from '~/worker/types';

type WorkerMessageType<T> = WorkerMessage<T>['type'];
type Handler<T> = (data: T) => unknown;
type Listeners = Partial<Record<WorkerMessageType<any>, Handler<any>[]>>;

interface IWorker {
    emit<T>(type: WorkerMessageType<T>, data?: T): void;
    on<T>(type: WorkerMessageType<T>, handler: Handler<T>): void;
    off<T>(type: WorkerMessageType<T>, handler?: Handler<T>): void;
    once<T>(type: WorkerMessageType<T>, handler: Handler<T>): void;
}

function handlerInListener<T>(listeners: Listeners, type: WorkerMessageType<T>, handler: Handler<T>) {
    return listeners[type]!.findIndex(f => Object.is(f, handler));
}
function pushFunctionToListener<T>(listeners: Listeners, type: WorkerMessageType<T>, handler: Handler<T>) {
    if (!listeners[type]) {
        listeners[type] = [];
    }
    if (handlerInListener(listeners, type, handler) !== -1) {
        return;
    }
    listeners[type]!.push(handler);
}
function removeFunctionFromListener<T>(listeners: Listeners, type: WorkerMessageType<T>, handler?: Handler<T>) {
    if (listeners[type]) {
        if (!handler) {
            delete listeners[type];
        } else {
            const index = handlerInListener(listeners, type, handler);
            if (index !== -1) {
                listeners[type]!.splice(index, 1);
            }
        }
    }
}
function callListener<T>(this: IWorker, listeners: Listeners, data: WorkerMessage<T>) {
    listeners[data.type]?.forEach(handler => {
        try {
            handler(data.data);
        } catch (e) {
            const error = e instanceof Error ? e : new Error(e);
            this.emit('ERROR', error);
        }
    });
}

export class WorkerSelf implements IWorker {
    private listeners: Listeners = {};
    private onceListeners: Listeners = {};

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

export class WebWorker extends Worker implements IWorker {
    private listeners: Listeners = {};
    private onceListeners: Listeners = {};

    constructor(...args: ConstructorParameters<typeof Worker>) {
        super(...args);
        this.addEventListener('message', this.listener.bind(this));
    }

    private listener<T>(e: WorkerMessageEvent<T>) {
        callListener.call(this, this.onceListeners, e.data);
        callListener.call(this, this.listeners, e.data);
        delete this.onceListeners[e.data.type];
    }

    emit<T>(type: WorkerMessageType<T>, data?: T) {
        this.postMessage({
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
