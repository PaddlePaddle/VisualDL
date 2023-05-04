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

import graph from '../../../assets/graph/yolov3.cfg';
// import onnx from '../../../assets/graph/mobilenetv2-7-0.onnx';
export default async () => {
    const result = await fetch(graph);
    // const result = await fetch(onnx);

    console.log('result', result);
    return new Response(await result.arrayBuffer(), {
        status: 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="yolov3.cfg"'
        }
    });
};
