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

/* eslint-disable @typescript-eslint/no-var-requires */

const express = require('express');
const mock = require('./mock');
const icons = require('./icons');
const netron = require('./netron');
const wasm = require('./wasm');

const argv = require('yargs').nargs('port', 1).number('port').nargs('host', 1).argv;

const app = express();

app.use(mock.pathname, mock.middleware());

app.use(icons.pathname, icons.middleware());

app.use(netron.pathname, express.static(netron.root, {index: false}));

app.get(`${wasm.pathname}/${wasm.out}`, (_req, res) => {
    res.type('application/wasm');
    res.sendFile(wasm.source);
});

app.listen(argv.port, argv.host);
