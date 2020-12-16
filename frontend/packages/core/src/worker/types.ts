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

type WorkerMessageType<T extends string, D = void> = {
    type: T;
    data: D;
};

export type InitializeData = {
    env: Record<string, string>;
};

type InitializeMessage = WorkerMessageType<'INITIALIZE', InitializeData>;
type InitializedMessage = WorkerMessageType<'INITIALIZED'>;
type RunMessage<T> = WorkerMessageType<'RUN', T>;
type ResultMessage<T> = WorkerMessageType<'RESULT', T>;
type InfoMessage<T> = WorkerMessageType<'INFO', T>;
type ErrorMessage<E extends Error = Error> = WorkerMessageType<'ERROR', E>;

export type WorkerMessage<T> =
    | InitializeMessage
    | InitializedMessage
    | RunMessage<T>
    | ResultMessage<T>
    | InfoMessage<T>
    | ErrorMessage;

export type WorkerMessageEvent<T> = MessageEvent<WorkerMessage<T>>;
