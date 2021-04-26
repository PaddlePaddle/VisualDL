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

// cSpell:words coord

import {ShaderChunk} from 'three';

export default /* glsl */ `
    varying vec3 vColor;

    ${ShaderChunk['common']}
    ${ShaderChunk['fog_pars_fragment']}

    void main() {
        float r = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (r < 0.5) {
            gl_FragColor = vec4(vColor, 1.0);
        } else {
            discard;
        }
        ${ShaderChunk['fog_fragment']}
    }
`;
