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

// cSpell:disable

import {Request, Response} from 'express';

import fetch from 'isomorphic-unfetch';

const model = 'https://gitee.com/public_sharing/ObjectDetection-YOLO/raw/master/yolov3.cfg';

export default async (req: Request, res: Response) => {
    const result = await fetch(model);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="yolov3.cfg"');
    return result.arrayBuffer();
};
