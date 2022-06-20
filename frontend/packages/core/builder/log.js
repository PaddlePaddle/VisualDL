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

/* eslint-disable no-console */

import chalk from 'chalk';
import moment from 'moment';

export default class Logger {
    name = '';
    startTime;

    constructor(name) {
        this.name = name;
        this.start();
    }

    #prepend() {
        let ret = `[${moment().format('HH:mm:ss')}] `;
        if (this.name) {
            ret += `[${this.name}] `;
        }
        return chalk.gray(ret);
    }

    log(msg) {
        console.log(this.#prepend() + msg);
    }

    info(msg) {
        this.log(msg);
    }

    warn(msg) {
        this.log(chalk.yellow(msg));
    }

    error(msg) {
        this.log(chalk.red(msg));
    }

    process(msg) {
        this.warn('! ' + msg);
    }

    start() {
        this.startTime = new Date().valueOf();
    }

    end(msg) {
        const endTime = new Date().valueOf();
        this.log(
            '✔ ' +
                msg +
                chalk.gray(` [${Math.round(moment.duration(endTime - this.startTime).asSeconds() * 100) / 100}s]`)
        );
    }

    complete(msg) {
        this.log(chalk.green.bold.underline(msg));
    }
}
