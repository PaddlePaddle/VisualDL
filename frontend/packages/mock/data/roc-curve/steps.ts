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

import {Request} from 'express';

export default (request: Request) => {
    if (request.query.run === 'train') {
        return [
            [1593069993786.464, 0],
            [1593069993787.353, 1],
            [1593069993788.1448, 2],
            [1593069993788.836, 3],
            [1593069993789.4, 4],
            [1593069993790.076, 5],
            [1593069993790.763, 6],
            [1593069993791.473, 7],
            [1593069993792.149, 8],
            [1593069993792.763, 9]
        ];
    }
    return [
        [1593069993538.6739, 0],
        [1593069993539.396, 1],
        [1593069993540.066, 2],
        [1593069993540.662, 3],
        [1593069993541.333, 4],
        [1593069993542.078, 5],
        [1593069993543.1821, 6],
        [1593069993543.998, 7],
        [1593069993544.9128, 8],
        [1593069993545.62, 9]
    ];
};
