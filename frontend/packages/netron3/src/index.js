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

// cSpell:words actived nextcode
const host = {};
// host.BrowserHost = class {
//     constructor() {
//         window.eval = () => {
//             throw new Error('window.eval() not supported.');
//         };
//         this._document = window.document;
//         this._meta = {};
//         for (const element of Array.from(this._document.getElementsByTagName('meta'))) {
//             if (element.content) {
//                 this._meta[element.name] = this._meta[element.name] || [];
//                 this._meta[element.name].push(element.content);
//             }
//         }
//         this._type = this._meta.type ? this._meta.type[0] : 'Browser';
//         this._version = this._meta.version ? this._meta.version[0] : null;
//         this._ready = false;
//     }

//     get document() {
//         return this._document;
//     }

//     get version() {
//         return this._version;
//     }

//     get type() {
//         return this._type;
//     }

//     initialize(view) {
//         this._view = view;
//         return Promise.resolve();
//     }
//     start() {
//         window.addEventListener(
//             'message',
//             event => {
//                 const originalData = event.data;
//                 if (originalData) {
//                     const type = originalData.type;
//                     const data = originalData.data;
//                     switch (type) {
//                         // 在此书添加一个this._view的事件传递Graph页面过来的数据
//                         case 'change-files':
//                             return this.status(data);
//                             return;
//                     }
//                 }
//             },
//             false
//         );

//         this._ready = true;
//         this.status('ready');
//     }

//     message(type, data) {
//         if (window.parent) {
//             window.parent.postMessage({type: type, data: data}, '*');
//         }
//     }

//     status(status) {
//         // 反传回去
//     }
// };
