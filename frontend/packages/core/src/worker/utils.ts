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

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {Handler, IWorker, Listeners, Runner, WorkerMessage, WorkerMessageType} from '~/worker/types';

export function checkWorkerModuleSupport() {
    let supports = false;
    const tester = {
        get type() {
            // it's been called, it's supported
            supports = true;
            return 'module' as const;
        }
    };
    try {
        // We use "blob://" as url to avoid an useless network request.
        // This will either throw in Chrome
        // either fire an error event in Firefox
        // which is perfect since
        // we don't need the worker to actually start,
        // checking for the type of the script is done before trying to load it.
        new Worker('blob://', tester);
    } finally {
        return supports;
    }
}

export function handlerInListener<T>(listeners: Listeners, type: WorkerMessageType<T>, handler: Handler<T>) {
    return listeners[type]!.findIndex(f => Object.is(f, handler));
}
export function pushFunctionToListener<T>(listeners: Listeners, type: WorkerMessageType<T>, handler: Handler<T>) {
    if (!listeners[type]) {
        listeners[type] = [];
    }
    if (handlerInListener(listeners, type, handler) !== -1) {
        return;
    }
    listeners[type]!.push(handler);
}
export function removeFunctionFromListener<T>(listeners: Listeners, type: WorkerMessageType<T>, handler?: Handler<T>) {
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
export function callListener<T>(this: IWorker, listeners: Listeners, data: WorkerMessage<T>) {
    listeners[data.type]?.forEach(handler => {
        try {
            handler(data.data);
        } catch (e) {
            const error = e instanceof Error ? e : new Error(e);
            this.emit('ERROR', error);
        }
    });
}

export async function runner(name: string, worker: IWorker) {
    const {default: runner}: {default: Runner} = await import(name);
    runner(worker);
}
