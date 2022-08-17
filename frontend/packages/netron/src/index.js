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

const view = require('./view');
const view2 = require('./view2');
const host = {};
host.BrowserHost = class {
    constructor() {
        window.eval = () => {
            throw new Error('window.eval() not supported.');
        };
        this._document = window.document;
        this._meta = {};
        for (const element of Array.from(this._document.getElementsByTagName('meta'))) {
            if (element.content) {
                this._meta[element.name] = this._meta[element.name] || [];
                this._meta[element.name].push(element.content);
            }
        }
        this._type = this._meta.type ? this._meta.type[0] : 'Browser';
        this._version = this._meta.version ? this._meta.version[0] : null;
        this._ready = false;
    }

    get document() {
        return this._document;
    }

    get version() {
        return this._version;
    }

    get type() {
        return this._type;
    }

    initialize(view) {
        this._view = view;
        return Promise.resolve();
    }
    start() {
        window.addEventListener(
            'message',
            event => {
                const originalData = event.data;
                if (originalData) {
                    const type = originalData.type;
                    const data = originalData.data;
                    switch (type) {
                        // 在此书添加一个this._view的事件传递Graph页面过来的数据
                        case 'change-files':
                            return this._changeFiles(data);
                        case 'zoom-in':
                            return this._view.zoomIn();
                        case 'zoom-out':
                            return this._view.zoomOut();
                        case 'select-item':
                            return this._view.selectItem(data);
                        case 'toggle-Language':
                            return this._view.toggleLanguage(data);
                        case 'isAlt':
                            return this._view.changeAlt(data);
                        case 'zoom-reset':
                            return this._view.resetZoom();
                        case 'toggle-attributes':
                            return this._view.toggleAttributes(data);
                        case 'toggle-initializers':
                            return this._view.toggleInitializers(data);
                        case 'toggle-names':
                            return this._view.toggleNames(data);
                        case 'toggle-KeepData':
                            return this._view.toggleKeepData(data);
                        case 'toggle-direction':
                            return this._view.toggleDirection(data);
                        case 'toggle-theme':
                            return this._view.toggleTheme(data);
                        case 'export':
                            return this._view.export(`${document.title}.${data}`);
                        case 'change-graph':
                            return this._view.changeGraph(data);
                        case 'change-allGraph':
                            return this._view.changeAllGrap(data);
                        case 'change-select':
                            return this._view.changeSelect(data);
                        case 'search':
                            return this._view.find(data);
                        case 'select':
                            return this._view.select(data);
                        case 'show-model-properties':
                            return this._view.showModelProperties();
                        case 'show-node-documentation':
                            return this._view.showNodeDocumentation(data);
                        case 'ready':
                            if (this._ready) {
                                return this.status('ready');
                            }
                            return;
                    }
                }
            },
            false
        );

        this._ready = true;
        this.status('ready');
    }

    message(type, data) {
        if (window.parent) {
            window.parent.postMessage({type: type, data: data}, '*');
        }
    }

    status(status) {
        // 反传回去
        this.message('status', status);
    }
    selectNodeId(nodeInfo) {
        // 反传回去
        this.message('nodeId', nodeInfo);
    }
    selectItems(item) {
        // 反传回去
        this.message('selectItem', item);
    }

    error(message, detail) {
        this.message('error', (message === 'Error' ? '' : message + ' ') + detail);
    }

    confirm(message, detail) {
        const result = confirm(message + ' ' + detail);
        if (!result) {
            this.message('cancel');
        }
        return result;
    }

    require(id) {
        const url = this._url(id + '.js');
        window.__modules__ = window.__modules__ || {};
        if (window.__modules__[url]) {
            return Promise.resolve(window.__exports__[url]);
        }
        return new Promise((resolve, reject) => {
            window.module = {exports: {}};
            const script = document.createElement('script');
            script.setAttribute('id', id);
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', url);
            script.onload = () => {
                const exports = window.module.exports;
                delete window.module;
                window.__modules__[id] = exports;
                resolve(exports);
            };
            script.onerror = e => {
                delete window.module;
                reject(new Error("The script '" + e.target.src + "' failed to load."));
            };
            this.document.head.appendChild(script);
        });
    }

    save(name, extension, defaultPath, callback) {
        callback(defaultPath + '.' + extension);
    }

    export(file, blob) {
        const element = this.document.createElement('a');
        element.download = file;
        element.href = URL.createObjectURL(blob);
        this.document.body.appendChild(element);
        element.click();
        this.document.body.removeChild(element);
    }

    request(base, file, encoding) {
        const url = base ? base + '/' + file : this._url(file);
        return this._request(url, null, encoding);
    }

    _changeFiles(files) {
        if (files && files.length) {
            files = Array.from(files);
            const file = files.find(file => this._view.accept(file.name));
            if (!file) {
                this.error('Error opening file.', 'Cannot open file ' + files[0].name);
                return;
            }
            this._open(
                files.find(file => this._view.accept(file.name)),
                files
            );
        }
    }

    _request(url, headers, encoding, timeout) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            if (!encoding) {
                request.responseType = 'arraybuffer';
            }
            if (timeout) {
                request.timeout = timeout;
            }
            const error = status => {
                const err = new Error('The web request failed with status code ' + status + " at '" + url + "'.");
                err.type = 'error';
                err.url = url;
                return err;
            };
            request.onload = () => {
                if (request.status == 200) {
                    if (request.responseType == 'arraybuffer') {
                        resolve(new Uint8Array(request.response));
                    } else {
                        resolve(request.responseText);
                    }
                } else {
                    reject(error(request.status));
                }
            };
            request.onerror = e => {
                const err = error(request.status);
                err.type = e.type;
                reject(err);
            };
            request.ontimeout = () => {
                request.abort();
                const err = new Error("The web request timed out in '" + url + "'.");
                err.type = 'timeout';
                err.url = url;
                reject(err);
            };
            request.open('GET', url, true);
            if (headers) {
                for (const name of Object.keys(headers)) {
                    request.setRequestHeader(name, headers[name]);
                }
            }
            request.send();
        });
    }

    _url(file) {
        let url = file;
        if (window && window.location && window.location.href) {
            let location = window.location.href.split('?').shift();
            if (location.endsWith('.html')) {
                location = location.split('/').slice(0, -1).join('/');
            }
            if (location.endsWith('/')) {
                location = location.slice(0, -1);
            }
            url = location + '/' + file;
        }
        return url;
    }

    _open(file, files) {
        this.status('loading');
        const context = new BrowserFileContext(file, files);
        context
            .open()
            .then(() => {
                return this._view.open(context).then(model => {
                    if (this._view.actived) {
                        this.status('rendered');
                    }
                    this.document.title = files[0].name;
                    return model;
                });
            })
            .catch(error => {
                this.error(error.name, error.message);
            });
    }
};

if (typeof TextDecoder === 'undefined') {
    TextDecoder = function TextDecoder(encoding) {
        this._encoding = encoding;
    };
    TextDecoder.prototype.decode = function decode(buffer) {
        let result = '';
        const length = buffer.length;
        let i = 0;
        switch (this._encoding) {
            case 'utf-8':
                while (i < length) {
                    const c = buffer[i++];
                    switch (c >> 4) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7: {
                            result += String.fromCharCode(c);
                            break;
                        }
                        case 12:
                        case 13: {
                            const c2 = buffer[i++];
                            result += String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
                            break;
                        }
                        case 14: {
                            const c2 = buffer[i++];
                            const c3 = buffer[i++];
                            result += String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | ((c3 & 0x3f) << 0));
                            break;
                        }
                    }
                }
                break;
            case 'ascii':
                while (i < length) {
                    result += String.fromCharCode(buffer[i++]);
                }
                break;
        }
        return result;
    };
}

if (typeof TextEncoder === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    TextEncoder = function TextEncoder() {};
    TextEncoder.prototype.encode = function encode(str) {
        'use strict';
        const length = str.length;
        let resPos = -1;
        const resArr = typeof Uint8Array === 'undefined' ? new Array(length * 2) : new Uint8Array(length * 3);
        for (let point = 0, nextcode = 0, i = 0; i !== length; ) {
            point = str.charCodeAt(i);
            i += 1;
            if (point >= 0xd800 && point <= 0xdbff) {
                if (i === length) {
                    resArr[(resPos += 1)] = 0xef;
                    resArr[(resPos += 1)] = 0xbf;
                    resArr[(resPos += 1)] = 0xbd;
                    break;
                }
                nextcode = str.charCodeAt(i);
                if (nextcode >= 0xdc00 && nextcode <= 0xdfff) {
                    point = (point - 0xd800) * 0x400 + nextcode - 0xdc00 + 0x10000;
                    i += 1;
                    if (point > 0xffff) {
                        resArr[(resPos += 1)] = (0x1e << 3) | (point >>> 18);
                        resArr[(resPos += 1)] = (0x2 << 6) | ((point >>> 12) & 0x3f);
                        resArr[(resPos += 1)] = (0x2 << 6) | ((point >>> 6) & 0x3f);
                        resArr[(resPos += 1)] = (0x2 << 6) | (point & 0x3f);
                        continue;
                    }
                } else {
                    resArr[(resPos += 1)] = 0xef;
                    resArr[(resPos += 1)] = 0xbf;
                    resArr[(resPos += 1)] = 0xbd;
                    continue;
                }
            }
            if (point <= 0x007f) {
                resArr[(resPos += 1)] = (0x0 << 7) | point;
            } else if (point <= 0x07ff) {
                resArr[(resPos += 1)] = (0x6 << 5) | (point >>> 6);
                resArr[(resPos += 1)] = (0x2 << 6) | (point & 0x3f);
            } else {
                resArr[(resPos += 1)] = (0xe << 4) | (point >>> 12);
                resArr[(resPos += 1)] = (0x2 << 6) | ((point >>> 6) & 0x3f);
                resArr[(resPos += 1)] = (0x2 << 6) | (point & 0x3f);
            }
        }
        if (typeof Uint8Array !== 'undefined') {
            return new Uint8Array(resArr.buffer.slice(0, resPos + 1));
        } else {
            return resArr.length === resPos + 1 ? resArr : resArr.slice(0, resPos + 1);
        }
    };
    TextEncoder.prototype.toString = function () {
        return '[object TextEncoder]';
    };
    try {
        Object.defineProperty(TextEncoder.prototype, 'encoding', {
            get: function () {
                if (Object.prototype.isPrototypeOf.call(TextEncoder.prototype, this)) {
                    return 'utf-8';
                } else {
                    throw TypeError('Illegal invocation');
                }
            }
        });
    } catch (e) {
        TextEncoder.prototype.encoding = 'utf-8';
    }
    if (typeof Symbol !== 'undefined') {
        TextEncoder.prototype[Symbol.toStringTag] = 'TextEncoder';
    }
}

if (typeof URLSearchParams === 'undefined') {
    URLSearchParams = function URLSearchParams(search) {
        const decode = str => {
            return str.replace(/[ +]/g, '%20').replace(/(%[a-f0-9]{2})+/gi, match => {
                return decodeURIComponent(match);
            });
        };
        this._dict = {};
        if (typeof search === 'string') {
            search = search.indexOf('?') === 0 ? search.substring(1) : search;
            const properties = search.split('&');
            for (const property of properties) {
                const index = property.indexOf('=');
                const name = index > -1 ? decode(property.substring(0, index)) : decode(property);
                const value = index > -1 ? decode(property.substring(index + 1)) : '';
                if (!Object.prototype.hasOwnProperty.call(this._dict, name)) {
                    this._dict[name] = [];
                }
                this._dict[name].push(value);
            }
        }
    };
    URLSearchParams.prototype.get = function (name) {
        return Object.prototype.hasOwnProperty.call(this._dict, name) ? this._dict[name][0] : null;
    };
}

if (!HTMLCanvasElement.prototype.toBlob) {
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
        setTimeout(() => {
            const data = atob(this.toDataURL(type, quality).split(',')[1]);
            const length = data.length;
            const buffer = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                buffer[i] = data.charCodeAt(i);
            }
            callback(new Blob([buffer], {type: type || 'image/png'}));
        }, 0);
    };
}

class BrowserFileContext {
    constructor(file, blobs) {
        this._file = file;
        this._blobs = {};
        for (const blob of blobs) {
            this._blobs[blob.name] = blob;
        }
    }

    get identifier() {
        return this._file.name;
    }

    get buffer() {
        return this._buffer;
    }

    open() {
        return this.request(this._file.name, null).then(data => {
            this._buffer = data;
        });
    }

    request(file, encoding) {
        const blob = this._blobs[file];
        if (!blob) {
            return Promise.reject(new Error("File not found '" + file + "'."));
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                resolve(encoding ? e.target.result : new Uint8Array(e.target.result));
            };
            reader.onerror = e => {
                e = e || window.event;
                let message = '';
                switch (e.target.error.code) {
                    case e.target.error.NOT_FOUND_ERR:
                        message = "File not found '" + file + "'.";
                        break;
                    case e.target.error.NOT_READABLE_ERR:
                        message = "File not readable '" + file + "'.";
                        break;
                    case e.target.error.SECURITY_ERR:
                        message = "File access denied '" + file + "'.";
                        break;
                    default:
                        message = "File read '" + e.target.error.code.toString() + "' error '" + file + "'.";
                        break;
                }
                reject(new Error(message));
            };
            if (encoding === 'utf-8') {
                reader.readAsText(blob, encoding);
            } else {
                reader.readAsArrayBuffer(blob);
            }
        });
    }
}

function getCaption(obj) {
    let index = obj.lastIndexOf('/'); //获取-后边的字符串
    let newObj = obj.substring(index + 1, obj.length);
    return newObj;
}
const hash = getCaption(document.referrer);
if (hash === 'graphStatic') {
    window.__view__ = new view2.View(new host.BrowserHost());
} else {
    window.__view__ = new view.View(new host.BrowserHost());
}
