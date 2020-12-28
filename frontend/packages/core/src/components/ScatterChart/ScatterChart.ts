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

// cSpell:words persp coord roboto

import * as THREE from 'three';
import * as d3 from 'd3';

import type {Point2D, Point3D} from './types';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import ScatterChartLabel from './ScatterChartLabel';

function createShaders() {
    const MIN_POINT_SIZE = 5;

    return {
        vertexShader: `
            attribute vec3 color;
            attribute float scaleFactor;

            uniform bool sizeAttenuation;
            uniform float pointSize;

            varying vec3 vColor;

            ${THREE.ShaderChunk['fog_pars_vertex']}

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
                    const float outNorm = (1. - minScale) / atan(outSpeed);
                    const float maxScale = 15.0;  // maximum scaling factor
                    const float inSpeed = 0.02;  // enlarge speed when zooming in
                    const float zoomOffset = 0.3;  // offset zoom pivot
                    float zoom = projectionMatrix[0][0] + zoomOffset;  // zoom pivot
                    float scale = zoom < 1. ? 1. + outNorm * atan(outSpeed * (zoom - 1.)) :
                                    1. + 2. / PI * (maxScale - 1.) * atan(inSpeed * (zoom - 1.));
                    outputPointSize = pointSize * scale;
                }
                gl_PointSize = max(outputPointSize * scaleFactor, ${MIN_POINT_SIZE.toFixed(1)});
                ${THREE.ShaderChunk['fog_vertex']}
            }
        `,
        fragmentShader: `
            varying vec3 vColor;

            ${THREE.ShaderChunk['common']}
            ${THREE.ShaderChunk['fog_pars_fragment']}

            void main() {
                float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                if (r < 0.5) {
                    gl_FragColor = vec4(vColor, 1);
                } else {
                    discard;
                }
                ${THREE.ShaderChunk['fog_fragment']}
            }
        `
    };
}

export type ScatterChartOptions = {
    width: number;
    height: number;
    is3D?: boolean;
    background?: string | number | THREE.Color;
};

export default class ScatterChart {
    static CUBE_LENGTH = 2;
    static MAX_ZOOM = 5 * ScatterChart.CUBE_LENGTH;
    static MIN_ZOOM = 0.025 * ScatterChart.CUBE_LENGTH;
    static PERSP_CAMERA_FOV_VERTICAL = 70;
    static PERSP_CAMERA_NEAR_CLIP_PLANE = 0.01;
    static PERSP_CAMERA_FAR_CLIP_PLANE = 100;
    static ORTHO_CAMERA_FRUSTUM_HALF_EXTENT = 1.2;
    static ORBIT_MOUSE_ROTATION_SPEED = 1;
    static ORBIT_ANIMATION_ROTATION_CYCLE_IN_SECONDS = 2;
    static NUM_POINTS_FOG_THRESHOLD = 5000;

    static POINT_COLOR_DEFAULT = new THREE.Color(0x7e7e7e);
    static POINT_COLOR_HOVER = new THREE.Color(0x2932e1);
    static POINT_COLOR_HIGHLIGHT = new THREE.Color(0x2932e1);
    static POINT_COLOR_FOCUS = new THREE.Color(0x2932e1);

    static POINT_SCALE_DEFAULT = 1.0;
    static POINT_SCALE_HOVER = 1.2;
    static POINT_SCALE_HIGHLIGHT = 1.0;
    static POINT_SCALE_FOCUS = 1.2;

    static PERSP_CAMERA_INIT_POSITION: Point3D = [0.45, 0.9, 1.6];
    static ORTHO_CAMERA_INIT_POSITION: Point3D = [0, 0, 4];

    width: number;
    height: number;
    background: string | number | THREE.Color = '#fff';
    is3D = true;
    data: Point3D[] = [];
    labels: string[] = [];
    private readonly container: HTMLElement;
    private canvas: HTMLCanvasElement | null;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private fog: THREE.Fog;
    private pickingTexture: THREE.WebGLRenderTarget;
    private geometry: THREE.BufferGeometry;
    private renderMaterial: THREE.ShaderMaterial | null = null;
    private pickingMaterial: THREE.ShaderMaterial | null = null;
    private positions: Float32Array | null = null;
    private renderColors: Float32Array | null = null;
    private pickingColors: Float32Array | null = null;
    private scaleFactors: Float32Array | null = null;
    private axes: THREE.AxesHelper | null = null;
    private points: THREE.Points | null = null;
    private focusedPointIndices: number[] = [];
    private hoveredPointIndices: number[] = [];
    private label: ScatterChartLabel;
    private highLightPointIndices: number[] = [];
    private mouseCoordinates: Point2D | null = null;

    private onMouseMoveBindThis: (e: MouseEvent) => void;

    private rotate = false;
    private animationId: number | null = null;

    constructor(container: HTMLElement, options: ScatterChartOptions) {
        this.container = container;
        this.width = options.width;
        this.height = options.height;
        this.is3D = options.is3D ?? this.is3D;
        this.background = options.background ?? this.background;

        this.canvas = this.initCanvas();
        this.container.appendChild(this.canvas);

        this.label = new ScatterChartLabel(this.container, {
            width: this.width,
            height: this.height
        });

        this.scene = this.initScene();
        this.camera = this.initCamera();
        this.renderer = this.initRenderer();
        this.controls = this.initControls();
        this.fog = this.initFog();
        this.pickingTexture = this.initRenderTarget();
        this.geometry = this.createGeometry();

        this.onMouseMoveBindThis = this.onMouseMove.bind(this);

        this.bindEventListeners();

        if (this.is3D) {
            this.addAxes();
        }

        this.reset();
    }

    private initCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        return canvas;
    }

    private initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(this.background);
        const light = new THREE.PointLight(16772287, 1, 0);
        light.name = 'light';
        scene.add(light);
        return scene;
    }

    private initCamera() {
        const origin = new THREE.Vector3(0, 0, 0);
        let camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
        if (this.is3D) {
            camera = new THREE.PerspectiveCamera(
                ScatterChart.PERSP_CAMERA_FOV_VERTICAL,
                this.width / this.height,
                ScatterChart.PERSP_CAMERA_NEAR_CLIP_PLANE,
                ScatterChart.PERSP_CAMERA_FAR_CLIP_PLANE
            );
            camera.position.set(...ScatterChart.PERSP_CAMERA_INIT_POSITION);
        } else {
            camera = new THREE.OrthographicCamera(
                -ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                -ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                -1000,
                1000
            );
            camera.position.set(...ScatterChart.ORTHO_CAMERA_INIT_POSITION);
            camera.up = new THREE.Vector3(0, 1, 0);
        }
        camera.lookAt(origin);
        camera.zoom = 1;
        camera.updateProjectionMatrix();
        return camera;
    }

    private initRenderer() {
        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas ?? undefined,
            alpha: true,
            premultipliedAlpha: false,
            antialias: false
        });
        renderer.setClearColor(this.background, 1);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(this.width, this.height);
        return renderer;
    }

    private initControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableRotate = this.is3D;
        controls.autoRotate = false;
        controls.rotateSpeed = ScatterChart.ORBIT_MOUSE_ROTATION_SPEED;
        controls.minDistance = ScatterChart.MIN_ZOOM;
        controls.maxDistance = ScatterChart.MAX_ZOOM;
        controls.mouseButtons.LEFT = this.is3D ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
        controls.reset();

        controls.addEventListener('start', () => {
            this.stopRotate();
        });
        controls.addEventListener('change', () => {
            this.render();
        });
        return controls;
    }

    private initFog() {
        return new THREE.Fog(this.background);
    }

    private initRenderTarget() {
        const renderCanvasSize = new THREE.Vector2();
        this.renderer.getSize(renderCanvasSize);
        const pixelRadio = this.renderer.getPixelRatio();
        const renderTarget = new THREE.WebGLRenderTarget(
            renderCanvasSize.width * pixelRadio,
            renderCanvasSize.height * pixelRadio
        );
        renderTarget.texture.minFilter = THREE.LinearFilter;
        return renderTarget;
    }

    private createShaderUniforms() {
        const fog = this.scene.fog as THREE.Fog | null;
        return {
            pointSize: {value: 200 / Math.log(this.data.length) / Math.log(8) / (this.is3D ? 1 : 1.5)},
            sizeAttenuation: {value: this.is3D},
            fogColor: {value: fog?.color},
            fogNear: {value: fog?.near},
            fogFar: {value: fog?.far}
        };
    }

    private createGeometry() {
        const geometry = new THREE.BufferGeometry();
        geometry.computeBoundingSphere();
        return geometry;
    }

    private setPointsPosition(positions: Float32Array) {
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    private setPointsColor(colors: Float32Array) {
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    private setPointsScaleFactor(scaleFactors: Float32Array) {
        this.geometry.setAttribute('scaleFactor', new THREE.BufferAttribute(scaleFactors, 1));
    }

    private createRenderMaterial() {
        const uniforms = this.createShaderUniforms();
        return new THREE.ShaderMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
            fog: true,
            blending: THREE.MultiplyBlending,
            uniforms,
            ...createShaders()
        });
    }

    private createPickingMaterial() {
        const uniforms = this.createShaderUniforms();
        return new THREE.ShaderMaterial({
            transparent: true,
            depthTest: true,
            depthWrite: true,
            fog: false,
            blending: THREE.NormalBlending,
            uniforms: uniforms,
            ...createShaders()
        });
    }

    private convertPointsPosition() {
        const data = this.data;

        const xScaler = d3.scaleLinear();
        const yScaler = d3.scaleLinear();
        let zScaler: d3.ScaleLinear<number, number> | null = null;
        const xExtent = d3.extent(data, (_p, i) => data[i][0]) as [number, number];
        const yExtent = d3.extent(data, (_p, i) => data[i][1]) as [number, number];
        const range = [-ScatterChart.CUBE_LENGTH / 2, ScatterChart.CUBE_LENGTH / 2];
        xScaler.domain(xExtent).range(range);
        yScaler.domain(yExtent).range(range);
        if (this.is3D) {
            zScaler = d3.scaleLinear();
            const zExtent = d3.extent(data, (_p, i) => data[i][2]) as [number, number];
            zScaler.domain(zExtent).range(range);
        }

        const dataInRange = data.map(d => [xScaler(d[0]) ?? 0, yScaler(d[1]) ?? 0, zScaler?.(d[2]) ?? 0] as Point3D);

        const positions = new Float32Array(dataInRange.length * 3);
        let dst = 0;
        dataInRange.forEach(d => {
            positions[dst++] = d[0];
            positions[dst++] = d[1];
            positions[dst++] = d[2];
        });
        return positions;
    }

    private convertPointsColor() {
        const count = this.data.length;
        const colors = new Float32Array(count * 3);
        let dst = 0;
        for (let i = 0; i < count; i++) {
            if (this.hoveredPointIndices.includes(i)) {
                colors[dst++] = ScatterChart.POINT_COLOR_HOVER.r;
                colors[dst++] = ScatterChart.POINT_COLOR_HOVER.g;
                colors[dst++] = ScatterChart.POINT_COLOR_HOVER.b;
            } else if (this.focusedPointIndices.includes(i)) {
                colors[dst++] = ScatterChart.POINT_COLOR_FOCUS.r;
                colors[dst++] = ScatterChart.POINT_COLOR_FOCUS.g;
                colors[dst++] = ScatterChart.POINT_COLOR_FOCUS.b;
            } else if (this.highLightPointIndices.includes(i)) {
                colors[dst++] = ScatterChart.POINT_COLOR_HIGHLIGHT.r;
                colors[dst++] = ScatterChart.POINT_COLOR_HIGHLIGHT.g;
                colors[dst++] = ScatterChart.POINT_COLOR_HIGHLIGHT.b;
            } else {
                colors[dst++] = ScatterChart.POINT_COLOR_DEFAULT.r;
                colors[dst++] = ScatterChart.POINT_COLOR_DEFAULT.g;
                colors[dst++] = ScatterChart.POINT_COLOR_DEFAULT.b;
            }
        }
        return colors;
    }

    private convertPointsScaleFactor() {
        const count = this.data.length;
        const scaleFactor = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            if (this.hoveredPointIndices.includes(i)) {
                scaleFactor[i] = ScatterChart.POINT_SCALE_HOVER;
            } else if (this.focusedPointIndices.includes(i)) {
                scaleFactor[i] = ScatterChart.POINT_SCALE_FOCUS;
            } else if (this.highLightPointIndices.includes(i)) {
                scaleFactor[i] = ScatterChart.POINT_SCALE_HIGHLIGHT;
            } else {
                scaleFactor[i] = ScatterChart.POINT_SCALE_DEFAULT;
            }
        }
        return scaleFactor;
    }

    private convertPointsPickingColor() {
        const count = this.data.length;
        const colors = new Float32Array(count * 3);
        let dst = 0;
        for (let i = 0; i < count; i++) {
            const color = new THREE.Color(i);
            colors[dst++] = color.r;
            colors[dst++] = color.g;
            colors[dst++] = color.b;
        }
        return colors;
    }

    private updatePointsAttribute() {
        this.renderColors = this.convertPointsColor();
        this.setPointsColor(this.renderColors);
        this.scaleFactors = this.convertPointsScaleFactor();
        this.setPointsScaleFactor(this.scaleFactors);
    }

    private updateHoveredPoints() {
        if (!this.mouseCoordinates) {
            return;
        }
        const dpr = window.devicePixelRatio || 1;
        const x = Math.floor(this.mouseCoordinates[0] * dpr);
        const y = Math.floor(this.mouseCoordinates[1] * dpr);
        const pointCount = this.data.length;
        const width = Math.floor(dpr);
        const height = Math.floor(dpr);
        const pixelBuffer = new Uint8Array(width * height * 4);
        this.renderer.readRenderTargetPixels(
            this.pickingTexture,
            x,
            this.pickingTexture.height - y,
            width,
            height,
            pixelBuffer
        );
        const pointIndicesSelection = new Uint8Array(pointCount);
        const pixels = width * height;
        for (let i = 0; i < pixels; i++) {
            const id = (pixelBuffer[i * 4] << 16) | (pixelBuffer[i * 4 + 1] << 8) | pixelBuffer[i * 4 + 2];
            if (id !== 16777215 && id < pointCount) {
                pointIndicesSelection[id] = 1;
            }
        }
        const pointIndices: number[] = [];
        for (let i = 0; i < pointIndicesSelection.length; i++) {
            if (pointIndicesSelection[i] === 1) {
                pointIndices.push(i);
            }
        }
        this.hoveredPointIndices = pointIndices;
    }

    private updateHoveredLabels() {
        if (!this.camera || !this.positions) {
            return;
        }

        const indices = this.focusedPointIndices.length ? this.focusedPointIndices : this.hoveredPointIndices;
        if (!indices.length) {
            this.label.clear();
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const w = this.width;
        const h = this.height;
        const labels = indices.map(index => {
            const pi = index * 3;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const point = new THREE.Vector3(this.positions![pi], this.positions![pi + 1], this.positions![pi + 2]);
            const pv = new THREE.Vector3().copy(point).project(this.camera);
            const coord: Point2D = [((pv.x + 1) / 2) * w * dpr, -(((pv.y - 1) / 2) * h) * dpr];
            return {
                text: this.labels[index] ?? '',
                fontSize: 40,
                fillColor: '#000',
                strokeColor: '#fff',
                opacity: 1,
                x: coord[0] + 4,
                y: coord[1]
            };
        });

        this.label.render(labels);
    }

    private updateLight() {
        const light = this.scene.getObjectByName('light') as THREE.PointLight;
        const cameraPos = this.camera.position;
        const lightPos = cameraPos.clone();
        lightPos.x += 1;
        lightPos.y += 1;
        light.position.set(lightPos.x, lightPos.y, lightPos.z);
    }

    private updateFog() {
        const fog = this.fog;

        fog.color = new THREE.Color(this.background);

        if (this.is3D && this.positions) {
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
                2 - Math.min(n, ScatterChart.NUM_POINTS_FOG_THRESHOLD) / ScatterChart.NUM_POINTS_FOG_THRESHOLD;

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

    private bindEventListeners() {
        this.canvas?.addEventListener('mousemove', this.onMouseMoveBindThis);
    }

    private removeEventListeners() {
        this.canvas?.removeEventListener('mousemove', this.onMouseMoveBindThis);
    }

    private onMouseMove(e: MouseEvent) {
        this.mouseCoordinates = [e.offsetX, e.offsetY];
        this.render();
    }

    private addAxes() {
        if (this.axes) {
            this.removeAxes();
        }
        this.axes = new THREE.AxesHelper();
        this.scene.add(this.axes);
    }

    private removeAxes() {
        if (this.axes) {
            this.scene.remove(this.axes);
            this.axes = null;
        }
    }

    private render() {
        this.updateLight();
        this.updateFog();

        this.updateHoveredPoints();
        this.updateHoveredLabels();
        this.updatePointsAttribute();

        if (this.pickingMaterial) {
            if (this.axes) {
                this.scene.remove(this.axes);
            }
            if (this.points) {
                this.points.material = this.pickingMaterial;
            }
            if (this.pickingColors) {
                this.setPointsColor(this.pickingColors);
            }
            this.renderer.setRenderTarget(this.pickingTexture);
            this.renderer.render(this.scene, this.camera);
            if (this.axes) {
                this.scene.add(this.axes);
            }
            if (this.points && this.renderMaterial) {
                this.points.material = this.renderMaterial;
            }
            if (this.renderColors) {
                this.setPointsColor(this.renderColors);
            }
        }
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
    }

    startRotate() {
        if (this.rotate) {
            return;
        }
        this.rotate = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = ScatterChart.ORBIT_ANIMATION_ROTATION_CYCLE_IN_SECONDS;
        const rotate = () => {
            this.controls.update();
            this.animationId = requestAnimationFrame(rotate);
        };
        rotate();
    }

    stopRotate() {
        if (this.rotate) {
            this.rotate = false;
            this.controls.autoRotate = false;
            this.controls.rotateSpeed = ScatterChart.ORBIT_MOUSE_ROTATION_SPEED;
            if (this.animationId != null) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    reset() {
        this.controls.reset();
        if (this.is3D && !this.animationId) {
            this.startRotate();
        }
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        if (this.is3D) {
            const camera = this.camera as THREE.PerspectiveCamera;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(width, height);
        this.label.setSize(width, height);
        this.pickingTexture = this.initRenderTarget();
        this.controls.update();
    }

    setDimension(is3D: boolean) {
        if (this.is3D === is3D) {
            return;
        }
        this.is3D = is3D;
        this.stopRotate();
        this.controls.dispose();
        this.camera = this.initCamera();
        this.controls = this.initControls();
        if (is3D) {
            this.addAxes();
            this.startRotate();
        } else {
            this.removeAxes();
        }
        this.setData(this.data);
    }

    setData(data: Point3D[]) {
        this.data = data;

        if (this.points) {
            this.scene.remove(this.points);
        }

        this.positions = this.convertPointsPosition();
        this.setPointsPosition(this.positions);
        this.pickingColors = this.convertPointsPickingColor();

        this.renderMaterial = this.createRenderMaterial();
        this.pickingMaterial = this.createPickingMaterial();
        this.points = new THREE.Points(this.geometry, this.renderMaterial);
        this.points.frustumCulled = false;
        this.scene.add(this.points);
        this.render();
    }

    setLabels(labels: string[]) {
        this.labels = labels;
        this.render();
    }

    setHighLightIndices(highLightIndices: number[]) {
        this.highLightPointIndices = highLightIndices;
        this.render();
    }

    setFocusedPointIndices(focusedPointIndices: number[]) {
        this.focusedPointIndices = focusedPointIndices;
        this.render();
    }

    dispose() {
        this.removeEventListeners();
        this.label.dispose();
        if (this.canvas) {
            this.container.removeChild(this.canvas);
            this.canvas = null;
        }
        this.renderer.dispose();
        this.controls.dispose();
        this.pickingTexture.dispose();
        this.geometry.dispose();
        this.renderMaterial?.dispose();
        this.pickingMaterial?.dispose();
    }
}
