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

import {ShaderChunk} from 'three';

export default /* glsl */ `
    attribute vec2 labelPosition;
    attribute vec3 color;
    varying vec2 vUv;
    varying vec3 vColor;

    ${ShaderChunk['common']}

    void main() {
        vUv = uv;
        vColor = color;

        vec4 vRight = vec4(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0], 0);
        vec4 vUp = vec4(modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1], 0);
        vec4 vAt = -vec4(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2], 0);

        mat4 pointToCamera = mat4(vRight, vUp, vAt, vec4(0, 0, 0, 1));

        vec4 posRotated = pointToCamera * vec4(labelPosition, 0, 1);
        vec4 mvPosition = modelViewMatrix * (vec4(position, 0) + posRotated);

        gl_Position = projectionMatrix * mvPosition;
    }
`;
