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

const MIN_POINT_SIZE = 5;

export default /* glsl */ `
    attribute vec3 color;
    attribute float scaleFactor;

    uniform bool sizeAttenuation;
    uniform float pointSize;

    varying vec3 vColor;

    ${ShaderChunk['fog_pars_vertex']}

    void main() {
        vColor = color;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float outputPointSize = pointSize;
        if (sizeAttenuation) {
            outputPointSize = -pointSize / mvPosition.z;
        } else {
            const float PI = 3.1415926535897932384626433832795;
            const float minScale = 0.1;  // minimum scaling factor
            const float outSpeed = 2.0;  // shrink speed when zooming out
            const float outNorm = (1.0 - minScale) / atan(outSpeed);
            const float maxScale = 15.0;  // maximum scaling factor
            const float inSpeed = 0.02;  // enlarge speed when zooming in
            const float zoomOffset = 0.3;  // offset zoom pivot
            float zoom = projectionMatrix[0][0] + zoomOffset;  // zoom pivot
            float scale = zoom < 1.0 ? 1.0 + outNorm * atan(outSpeed * (zoom - 1.0)) :
                            1.0 + 2.0 / PI * (maxScale - 1.0) * atan(inSpeed * (zoom - 1.0));
            outputPointSize = pointSize * scale;
        }
        gl_PointSize = max(outputPointSize * scaleFactor, ${MIN_POINT_SIZE.toFixed(1)});
        ${ShaderChunk['fog_vertex']}
    }
`;
