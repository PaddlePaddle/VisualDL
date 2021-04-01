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

import * as THREE from 'three';

import type {Point2D} from '../types';
import ScatterChart from '../ScatterChart';
import ScatterChartLabel from '../ScatterChartLabel';
import type {ScatterChartOptions} from '../ScatterChart';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

export default class PointScatter extends ScatterChart {
    static readonly NUM_POINTS_FOG_THRESHOLD = 5000;

    static readonly POINT_COLOR_DEFAULT = new THREE.Color(0x7e7e7e);
    static readonly POINT_COLOR_HOVER = new THREE.Color(0x2932e1);
    static readonly POINT_COLOR_HIGHLIGHT = new THREE.Color(0x2932e1);
    static readonly POINT_COLOR_FOCUS = new THREE.Color(0x2932e1);

    static readonly POINT_SCALE_DEFAULT = 1.0;
    static readonly POINT_SCALE_HOVER = 1.2;
    static readonly POINT_SCALE_HIGHLIGHT = 1.0;
    static readonly POINT_SCALE_FOCUS = 1.2;

    protected blending: THREE.Blending = THREE.MultiplyBlending;
    protected depth = false;
    protected vertexShader: string = vertexShader;
    protected fragmentShader: string = fragmentShader;

    private scaleFactors: Float32Array | null = null;

    private points: THREE.Points | null = null;
    private label: ScatterChartLabel;

    get object() {
        return this.points;
    }

    constructor(container: HTMLElement, options: ScatterChartOptions) {
        super(container, options);
        this.label = new ScatterChartLabel(this.container, {
            width: this.width,
            height: this.height
        });
        this.fog = this.initFog();
    }

    private initFog() {
        return new THREE.Fog(this.background);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected createShaderUniforms(): Record<string, THREE.IUniform<any>> {
        const fog = this.scene.fog as THREE.Fog | null;
        return {
            pointSize: {value: 200 / Math.log(this.dataCount) / Math.log(8) / (this.is3D ? 1 : 1.5)},
            sizeAttenuation: {value: this.is3D},
            fogColor: {value: fog?.color},
            fogNear: {value: fog?.near},
            fogFar: {value: fog?.far}
        };
    }

    private setPointsScaleFactor(scaleFactors: Float32Array) {
        this.setGeometryAttribute('scaleFactor', scaleFactors, 1);
    }

    private convertPointsColor() {
        const count = this.dataCount;
        const colors = new Float32Array(count * 3);
        let dst = 0;
        for (let i = 0; i < count; i++) {
            if (this.hoveredDataIndices.includes(i)) {
                colors[dst++] = PointScatter.POINT_COLOR_HOVER.r;
                colors[dst++] = PointScatter.POINT_COLOR_HOVER.g;
                colors[dst++] = PointScatter.POINT_COLOR_HOVER.b;
            } else if (this.focusedDataIndices.includes(i)) {
                colors[dst++] = PointScatter.POINT_COLOR_FOCUS.r;
                colors[dst++] = PointScatter.POINT_COLOR_FOCUS.g;
                colors[dst++] = PointScatter.POINT_COLOR_FOCUS.b;
            } else if (this.highLightDataIndices.includes(i)) {
                colors[dst++] = PointScatter.POINT_COLOR_HIGHLIGHT.r;
                colors[dst++] = PointScatter.POINT_COLOR_HIGHLIGHT.g;
                colors[dst++] = PointScatter.POINT_COLOR_HIGHLIGHT.b;
            } else {
                colors[dst++] = PointScatter.POINT_COLOR_DEFAULT.r;
                colors[dst++] = PointScatter.POINT_COLOR_DEFAULT.g;
                colors[dst++] = PointScatter.POINT_COLOR_DEFAULT.b;
            }
        }
        return colors;
    }

    private convertPointsScaleFactor() {
        const count = this.dataCount;
        const scaleFactor = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            if (this.hoveredDataIndices.includes(i)) {
                scaleFactor[i] = PointScatter.POINT_SCALE_HOVER;
            } else if (this.focusedDataIndices.includes(i)) {
                scaleFactor[i] = PointScatter.POINT_SCALE_FOCUS;
            } else if (this.highLightDataIndices.includes(i)) {
                scaleFactor[i] = PointScatter.POINT_SCALE_HIGHLIGHT;
            } else {
                scaleFactor[i] = PointScatter.POINT_SCALE_DEFAULT;
            }
        }
        return scaleFactor;
    }

    private updateHoveredLabels() {
        if (!this.camera || !this.positions.length) {
            return;
        }

        const indices = this.focusedDataIndices.length ? this.focusedDataIndices : this.hoveredDataIndices;
        if (!indices.length) {
            this.label.clear();
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const w = this.width;
        const h = this.height;
        const labels = indices.map(index => {
            const pi = index * 3;
            const point = new THREE.Vector3(this.positions[pi], this.positions[pi + 1], this.positions[pi + 2]);
            const pv = new THREE.Vector3().copy(point).project(this.camera);
            const coordinate: Point2D = [((pv.x + 1) / 2) * w * dpr, -(((pv.y - 1) / 2) * h) * dpr];
            return {
                text: this.labels[index] ?? '',
                fontSize: 40,
                fillColor: '#000',
                strokeColor: '#fff',
                opacity: 1,
                x: coordinate[0] + 4,
                y: coordinate[1]
            };
        });

        this.label.render(labels);
    }

    private updateFog() {
        const fog = this.fog;
        if (fog) {
            fog.color = new THREE.Color(this.background);

            if (this.is3D && this.positions.length) {
                const cameraPos = this.camera.position;
                const cameraTarget = this.controls.target;

                let shortestDist = Number.POSITIVE_INFINITY;
                let furthestDist = 0;

                const camToTarget = new THREE.Vector3().copy(cameraTarget).sub(cameraPos);
                const camPlaneNormal = new THREE.Vector3().copy(camToTarget).normalize();

                const n = this.positions.length / 3;
                let src = 0;
                const p = new THREE.Vector3();
                const camToPoint = new THREE.Vector3();
                for (let i = 0; i < n; i++) {
                    p.x = this.positions[src++];
                    p.y = this.positions[src++];
                    p.z = this.positions[src++];

                    camToPoint.copy(p).sub(cameraPos);
                    const dist = camPlaneNormal.dot(camToPoint);
                    if (dist < 0) {
                        continue;
                    }

                    furthestDist = dist > furthestDist ? dist : furthestDist;
                    shortestDist = dist < shortestDist ? dist : shortestDist;
                }

                const multiplier =
                    2 - Math.min(n, PointScatter.NUM_POINTS_FOG_THRESHOLD) / PointScatter.NUM_POINTS_FOG_THRESHOLD;

                fog.near = shortestDist;
                fog.far = furthestDist * multiplier;
            } else {
                fog.near = Number.POSITIVE_INFINITY;
                fog.far = Number.POSITIVE_INFINITY;
            }

            if (this.points) {
                const material = this.points.material as THREE.ShaderMaterial;
                material.uniforms.fogColor.value = fog.color;
                material.uniforms.fogNear.value = fog.near;
                material.uniforms.fogFar.value = fog.far;
            }

            this.scene.fog = fog;
        }
    }

    protected onRender() {
        this.colors = this.convertPointsColor();
        this.updateFog();
        this.updateHoveredLabels();
        this.scaleFactors = this.convertPointsScaleFactor();
        this.setPointsScaleFactor(this.scaleFactors);
    }

    protected onSetSize(width: number, height: number) {
        this.label.setSize(width, height);
    }

    protected onDataSet() {
        this.setPosition(this.positions);
        this.createMaterial();
        if (this.material) {
            this.points = new THREE.Points(this.geometry, this.material);
            this.points.frustumCulled = false;
        }
    }

    protected onDispose() {
        this.label.dispose();
    }
}
