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

// cspell:words mipmaps

import * as THREE from 'three';

import type {Point2D} from '../types';
import ScatterChart from '../ScatterChart';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

const CANVAS_MAX_WIDTH = 16384;
const CANVAS_MAX_HEIGHT = 16384;
const VERTEX_COUNT_PER_LABEL = 6;

type Position2D = [Point2D, Point2D];

export default class LabelScatterChart extends ScatterChart {
    static readonly LABEL_COLOR = new THREE.Color(0x000000);
    static readonly LABEL_BACKGROUND_COLOR_DEFAULT = new THREE.Color(0xffffff);
    static readonly LABEL_BACKGROUND_COLOR_HOVER = new THREE.Color(0x2932e1);
    static readonly LABEL_BACKGROUND_COLOR_HIGHLIGHT = new THREE.Color(0x2932e1);
    static readonly LABEL_BACKGROUND_COLOR_FOCUS = new THREE.Color(0x2932e1);

    static readonly LABEL_FONT = 'roboto';
    static readonly LABEL_FONT_SIZE = 20;
    static readonly LABEL_PADDING = [3, 5] as const;

    protected blending: THREE.Blending = THREE.NormalBlending;
    protected vertexShader: string = vertexShader;
    protected fragmentShader: string = fragmentShader;

    private glyphTexture: THREE.CanvasTexture | null = null;
    private mesh: THREE.Mesh | null = null;
    private textWidthInGlyphTexture: number[] = [];
    private textPositionInGlyphTexture: Position2D[] = [];

    get object() {
        return this.mesh;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected createShaderUniforms(picking: boolean): Record<string, THREE.IUniform<any>> {
        return {
            glyphTexture: {value: this.glyphTexture},
            picking: {value: picking}
        };
    }

    private convertVertexes() {
        const count = this.dataCount;
        const vertexes = new Float32Array(count * VERTEX_COUNT_PER_LABEL * 3);
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < VERTEX_COUNT_PER_LABEL; j++) {
                for (let k = 0; k < 3; k++) {
                    vertexes[i * VERTEX_COUNT_PER_LABEL * 3 + j * 3 + k] = this.positions[i * 3 + k];
                }
            }
        }
        return vertexes;
    }

    private convertPickingColors() {
        if (this.pickingColors) {
            const count = this.dataCount;
            const colors = new Float32Array(count * VERTEX_COUNT_PER_LABEL * 3);
            for (let i = 0; i < count; i++) {
                for (let j = 0; j < VERTEX_COUNT_PER_LABEL; j++) {
                    for (let k = 0; k < 3; k++) {
                        colors[i * VERTEX_COUNT_PER_LABEL * 3 + j * 3 + k] = this.pickingColors[i * 3 + k];
                    }
                }
            }
            return colors;
        }
        return null;
    }

    private convertPositionsToLabelPosition() {
        const count = this.dataCount;
        const vertexes = new Float32Array(count * VERTEX_COUNT_PER_LABEL * 2);
        const scaleFactor = 1 / (700 * LabelScatterChart.CUBE_LENGTH);
        const height = (LabelScatterChart.LABEL_FONT_SIZE + 2 * LabelScatterChart.LABEL_PADDING[0]) * scaleFactor;
        for (let i = 0; i < count; i++) {
            const vi = i * VERTEX_COUNT_PER_LABEL * 2;
            const width = this.textWidthInGlyphTexture[i] * scaleFactor;
            const x1 = -width;
            const y1 = -height;
            const x2 = width;
            const y2 = height;
            vertexes[vi] = x1;
            vertexes[vi + 1] = y1;
            vertexes[vi + 2] = x2;
            vertexes[vi + 3] = y1;
            vertexes[vi + 4] = x1;
            vertexes[vi + 5] = y2;
            vertexes[vi + 6] = x1;
            vertexes[vi + 7] = y2;
            vertexes[vi + 8] = x2;
            vertexes[vi + 9] = y1;
            vertexes[vi + 10] = x2;
            vertexes[vi + 11] = y2;
        }
        return vertexes;
    }

    private convertGlyphTexturePositionsToUV() {
        const count = this.dataCount;
        const uv = new Float32Array(count * VERTEX_COUNT_PER_LABEL * 2);
        for (let i = 0; i < count; i++) {
            const vi = i * VERTEX_COUNT_PER_LABEL * 2;
            let x1 = 0;
            let y1 = 0;
            let x2 = 1;
            let y2 = 1;
            if (this.textPositionInGlyphTexture[i]) {
                const [topLeft, bottomRight] = this.textPositionInGlyphTexture[i];
                x1 = topLeft[0];
                y1 = 1 - topLeft[1];
                x2 = bottomRight[0];
                y2 = 1 - bottomRight[1];
            }
            uv[vi] = x1;
            uv[vi + 1] = y2;
            uv[vi + 2] = x2;
            uv[vi + 3] = y2;
            uv[vi + 4] = x1;
            uv[vi + 5] = y1;
            uv[vi + 6] = x1;
            uv[vi + 7] = y1;
            uv[vi + 8] = x2;
            uv[vi + 9] = y2;
            uv[vi + 10] = x2;
            uv[vi + 11] = y1;
        }
        return uv;
    }

    private convertVertexColors() {
        const count = this.dataCount;
        const colors = new Float32Array(count * VERTEX_COUNT_PER_LABEL * 3);
        for (let i = 0; i < count; i++) {
            let color: THREE.Color;
            if (this.hoveredDataIndices.includes(i)) {
                color = LabelScatterChart.LABEL_BACKGROUND_COLOR_HOVER;
            } else if (this.focusedDataIndices.includes(i)) {
                color = LabelScatterChart.LABEL_BACKGROUND_COLOR_FOCUS;
            } else if (this.highLightDataIndices.includes(i)) {
                color = LabelScatterChart.LABEL_BACKGROUND_COLOR_HIGHLIGHT;
            } else {
                color = LabelScatterChart.LABEL_BACKGROUND_COLOR_DEFAULT;
            }
            for (let j = 0; j < VERTEX_COUNT_PER_LABEL; j++) {
                colors[i * VERTEX_COUNT_PER_LABEL * 3 + j * 3] = color.r;
                colors[i * VERTEX_COUNT_PER_LABEL * 3 + j * 3 + 1] = color.g;
                colors[i * VERTEX_COUNT_PER_LABEL * 3 + j * 3 + 2] = color.b;
            }
        }
        return colors;
    }

    private createGlyphTexture() {
        const dpr = window.devicePixelRatio;
        const labelCount = this.labels.length;
        const fontSize = LabelScatterChart.LABEL_FONT_SIZE * dpr;
        const font = `bold ${fontSize}px roboto`;
        const [vPadding, hPadding] = LabelScatterChart.LABEL_PADDING;
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_MAX_WIDTH;
        canvas.height = fontSize;
        const ctx = canvas.getContext('2d');
        let canvasWidth = 0;
        let canvasHeight = fontSize + 2 * vPadding;
        const positions: Position2D[] = [];
        const textWidths: number[] = [];
        if (ctx) {
            ctx.font = font;
            ctx.fillStyle = LabelScatterChart.LABEL_COLOR.getStyle();
            ctx.textAlign = 'start';
            ctx.textBaseline = 'top';
            let x = hPadding;
            let y = vPadding;
            for (let i = 0; i < labelCount; i++) {
                const label = this.labels[i];
                const index = this.labels.indexOf(label);
                if (index >= 0 && i !== index) {
                    textWidths.push(textWidths[index]);
                    // deep copy position
                    positions.push([
                        [positions[index][0][0], positions[index][0][1]],
                        [positions[index][1][0], positions[index][1][1]]
                    ]);
                    continue;
                }
                const textWidth = Math.ceil(ctx.measureText(label).width);
                textWidths.push(Math.floor(textWidth / dpr) + 2 * hPadding);
                const deltaX = textWidth + hPadding;
                const deltaY = fontSize + vPadding;
                if (x + deltaX > CANVAS_MAX_WIDTH) {
                    x = hPadding;
                    y += deltaY;
                    if (y > CANVAS_MAX_HEIGHT) {
                        throw new Error('Texture too large!');
                    }
                    canvasHeight = y + deltaY;
                }
                positions.push([
                    [x - hPadding, y - vPadding],
                    [x + deltaX, y + deltaY]
                ]);
                x += deltaX;
                if (canvasWidth < x) {
                    canvasWidth = x;
                }
            }
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.font = font;
            ctx.fillStyle = LabelScatterChart.LABEL_COLOR.getStyle();
            ctx.textAlign = 'start';
            ctx.textBaseline = 'top';
            for (let i = 0; i < labelCount; i++) {
                const label = this.labels[i];
                const index = this.labels.indexOf(label);
                if (index >= 0 && i !== index) {
                    continue;
                }
                const [position] = positions[i];
                ctx.fillText(label, position[0] + hPadding, position[1] + vPadding);
            }
            positions.forEach(position => {
                position[0][0] /= canvasWidth;
                position[0][1] /= canvasHeight;
                position[1][0] /= canvasWidth;
                position[1][1] /= canvasHeight;
            });
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.flipY = true;
        this.glyphTexture = texture;
        this.textWidthInGlyphTexture = textWidths;
        this.textPositionInGlyphTexture = positions;
    }

    private setLabelPosition(position: Float32Array) {
        this.setGeometryAttribute('labelPosition', position, 2);
    }

    private setTextureUV(uv: Float32Array) {
        this.setGeometryAttribute('uv', uv, 2);
    }

    protected onRender() {
        this.colors = this.convertVertexColors();
    }

    protected onSetSize() {
        // nothing to do
    }

    protected onDataSet() {
        this.createGlyphTexture();
        const uv = this.convertGlyphTexturePositionsToUV();
        this.setTextureUV(uv);
        const labelPosition = this.convertPositionsToLabelPosition();
        this.setLabelPosition(labelPosition);
        const vertexes = this.convertVertexes();
        this.setPosition(vertexes);
        this.pickingColors = this.convertPickingColors();
        this.createMaterial();
        if (this.material) {
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.frustumCulled = false;
        }
    }

    protected onDispose() {
        this.glyphTexture?.dispose();
    }
}
