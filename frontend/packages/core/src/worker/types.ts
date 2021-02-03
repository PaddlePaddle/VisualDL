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

type Env = Record<string, string>;
export type InitializeData = {
    name: string;
    env: Env;
};

type WorkerMessageData<T extends string, D = void> = {
    type: T;
    data: D;
};

type InitializeMessage = WorkerMessageData<'INITIALIZE', InitializeData>;
type InitializedMessage = WorkerMessageData<'INITIALIZED'>;
type RunMessage<T> = WorkerMessageData<'RUN', T>;
type ResultMessage<T> = WorkerMessageData<'RESULT', T>;
type InfoMessage<T> = WorkerMessageData<'INFO', T>;
type ErrorMessage<E extends Error = Error> = WorkerMessageData<'ERROR', E>;

export type WorkerMessage<T> =
    | InitializeMessage
    | InitializedMessage
    | RunMessage<T>
    | ResultMessage<T>
    | InfoMessage<T>
    | ErrorMessage;

export type WorkerMessageEvent<T> = MessageEvent<WorkerMessage<T>>;

export type WorkerMessageType<T> = WorkerMessage<T>['type'];
export type Handler<T> = (data: T) => unknown;
export type Listeners = Partial<Record<WorkerMessageType<any>, Handler<any>[]>>;

export interface IWorker {
    env: Env;
    emit<T>(type: WorkerMessageType<T>, data?: T): void;
    on<T>(type: WorkerMessageType<T>, handler: Handler<T>): void;
    off<T>(type: WorkerMessageType<T>, handler?: Handler<T>): void;
    once<T>(type: WorkerMessageType<T>, handler: Handler<T>): void;
}

export type Runner = (worker: IWorker) => void;
