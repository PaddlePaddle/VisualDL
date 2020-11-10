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

import type {WorkerMessage, WorkerMessageEvent} from '~/worker/types';

type WorkerMessageType<T> = WorkerMessage<T>['type'];
type Handler<T> = (data: T) => unknown;

export class WorkerSelf {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private listeners: Partial<Record<WorkerMessageType<any>, Handler<any>[]>> = {};

    constructor() {
        self.addEventListener('message', this.listener.bind(this));
    }

    private listener<T>(e: WorkerMessageEvent<T>) {
        this.listeners[e.data.type]?.forEach(handler => {
            try {
                handler(e.data.data);
            } catch (e) {
                const error = e instanceof Error ? e : new Error(e);
                this.emit('ERROR', error);
            }
        });
    }

    emit<T>(type: WorkerMessageType<T>, data?: T) {
        self.postMessage({
            type,
            data
        } as WorkerMessage<T>);
    }

    on<T>(type: WorkerMessageType<T>, handler: Handler<T>) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        if (this.listeners[type]!.findIndex(f => Object.is(f, handler)) !== -1) {
            return;
        }
        this.listeners[type]!.push(handler);
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

    off<T>(type: WorkerMessageType<T>, handler?: Handler<T>) {
        if (this.listeners[type]) {
            if (!handler) {
                delete this.listeners[type];
            } else {
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                const index = this.listeners[type]!.findIndex(f => Object.is(f, handler));
                this.listeners[type]!.splice(index, 1);
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
            }
        }
    }
}

export class WebWorker extends Worker {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private listeners: Partial<Record<WorkerMessageType<any>, Handler<any>[]>> = {};

    constructor(...args: ConstructorParameters<typeof Worker>) {
        super(...args);
        this.addEventListener('message', this.listener.bind(this));
    }

    private listener<T>(e: WorkerMessageEvent<T>) {
        this.listeners[e.data.type]?.forEach(handler => handler(e.data.data));
    }

    emit<T>(type: WorkerMessageType<T>, data?: T) {
        this.postMessage({
            type,
            data
        } as WorkerMessage<T>);
    }

    on<T>(type: WorkerMessageType<T>, handler: Handler<T>) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        if (this.listeners[type]!.findIndex(f => Object.is(f, handler)) !== -1) {
            return;
        }
        this.listeners[type]!.push(handler);
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }

    off<T>(type: WorkerMessageType<T>, handler?: Handler<T>) {
        if (this.listeners[type]) {
            if (!handler) {
                delete this.listeners[type];
            } else {
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                const index = this.listeners[type]!.findIndex(f => Object.is(f, handler));
                this.listeners[type]!.splice(index, 1);
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
            }
        }
    }
}
