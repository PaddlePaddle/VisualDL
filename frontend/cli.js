#!/usr/bin/env node

process.env.NODE_ENV = 'production';

require('./dist/server/index.js');
