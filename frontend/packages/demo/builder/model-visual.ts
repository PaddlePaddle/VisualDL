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

import type {Worker} from './types';

type GraphItem = {
    head: string[];
    tail: string;
    name: string;
};

const worker: Worker = async io => {
    const joinGraphData: GraphItem[] = await io.save('/model/network', {stage: 'join'});
    const updateGraphData: GraphItem[] = await io.save('/model/network', {stage: 'update'});
    const nodes = {
        join: [],
        update: []
    };
    Array.isArray(joinGraphData) && joinGraphData.forEach(item => {
        const {head, tail} = item;
        !nodes.join.includes(tail) && nodes.join.push(tail);
        head.forEach(item => {
            !nodes.join.includes(item) && nodes.join.push(item);
        });
    });
    Array.isArray(updateGraphData) && updateGraphData.forEach(item => {
        const {head, tail} = item;
        !nodes.update.includes(tail) && nodes.update.push(tail);
        head.forEach(item => {
            !nodes.update.includes(item) && nodes.update.push(item);
        });
    });
    nodes.join.forEach(async node => {
        await io.save('/model/nodebasic', {stage: 'join', node});
        await io.save('/model/nodedetail', {stage: 'join', node, type: '1'});
        await io.save('/model/nodedetail', {stage: 'join', node: node + '@GRAD', type: '1'});
        await io.save('/model/nodedetail', {stage: 'join', node, type: '2'});
        await io.save('/model/nodedetail', {stage: 'join', node: node + '@GRAD', type: '2'});
    });
    nodes.update.forEach(async node => {
        await io.save('/model/nodebasic', {stage: 'update', node});
        await io.save('/model/nodedetail', {stage: 'update', node, type: '1'});
        await io.save('/model/nodedetail', {stage: 'update', node: node + '@GRAD', type: '1'});
        await io.save('/model/nodedetail', {stage: 'update', node, type: '2'});
        await io.save('/model/nodedetail', {stage: 'update', node: node + '@GRAD', type: '2'});
    });
};

export default worker;
