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

export default /* glsl */ `
    uniform sampler2D glyphTexture;
    uniform bool picking;
    varying vec2 vUv;
    varying vec3 vColor;

    void main() {
        if (picking) {
            gl_FragColor = vec4(vColor, 1.0);
        } else {
            vec4 fromTexture = texture(glyphTexture, vUv);
            gl_FragColor = vec4(vColor, 1.0) * fromTexture;
        }
    }
`;
