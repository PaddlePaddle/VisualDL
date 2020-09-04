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
